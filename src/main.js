import { Amplify } from 'aws-amplify';
import { generateClient } from 'aws-amplify/api';
import { fetchAuthSession, signUp, signIn, signOut, getCurrentUser } from 'aws-amplify/auth';
import { uploadData, getUrl } from 'aws-amplify/storage';
import awsconfig from './aws-exports';
import { createTodo, deleteTodo, updateTodo } from './graphql/mutations'; // Assuming you have queries in graphql.js
import { listTodos } from './graphql/queries'; // Assuming you have queries in graphql.js

const authToken = (await fetchAuthSession()).tokens?.idToken?.toString();

Amplify.configure(awsconfig);

// Initialize the client for API calls
const AppSyncClient = generateClient();

// AUTHENTICATION LOGIC (same as before)
document.getElementById('signup-button').addEventListener('click', async () => {
  const username = document.getElementById('signup-username').value;
  const password = document.getElementById('signup-password').value;
  const email = document.getElementById('signup-email').value;
  let signUpData = { username, password };
  if(email && email.length) {
    signUpData.options = {
      userAttributes: {
        email,
      },
    }
  }

  try {
    const { isSignUpComplete, userId, nextStep } = await signUp(signUpData);
    console.log('User signed up:', userId);
    alert('Sign up successful.');
  } catch (error) {
    console.error('Error signing up:', error);
    alert(error.message);
  }
});

document.getElementById('signin-button').addEventListener('click', async () => {
  const username = document.getElementById('signin-username').value;
  const password = document.getElementById('signin-password').value;

  try {
    const { isSignedIn, nextStep } = await signIn({ username, password });
    alert('Signed in successfully!');
    fetchTodos(); // Fetch ToDos after sign in
  } catch (error) {
    console.error('Error signing in:', error);
    alert(error.message);
  }
});

document.getElementById('signout-button').addEventListener('click', async () => {
  try {
    await signOut();
    console.log('User signed out');
    alert('Signed out successfully!');
    document.getElementById('todos-list').innerHTML = ''; // Clear ToDos after sign out
  } catch (error) {
    console.error('Error signing out:', error);
  }
});

// TODO CRUD OPERATIONS

// Fetch Todos
// fetchTodos();
async function fetchTodos() {
  try {
  	const result = await AppSyncClient.graphql({
      query: listTodos,
    });
    const todos = result.data.listTodos.items;
    console.log('Fetched ToDos:', todos);
    renderTodos(todos);
  } catch (error) {
    console.error('Error fetching todos:', error);
  }
}

// Create a ToDo
document.getElementById('create-todo-button').addEventListener('click', async () => {
  const name = document.getElementById('todo-name').value;
  const description = document.getElementById('todo-description').value;

  if (!name || !description) {
    alert('Please enter both name and description for the ToDo.');
    return;
  }

  try {
    const newTodo = await AppSyncClient.graphql({
      query: createTodo,
      variables: {
        input: {
	        name,
	        description,
        }
      },
      // authMode: "AMAZON_COGNITO_USER_POOLS"
    });
    console.log('Created new ToDo:', newTodo);
    fetchTodos(); // Refresh the ToDo list
  } catch (error) {
    console.error('Error creating todo:', error);
  }
});

// Update a ToDo
async function updateExistingTodo(todoId, name, description) {
  try {
    const input = { id: todoId, name, description };
    const updatedTodo = await AppSyncClient.graphql({
      query: updateTodo,
      variables: input,
      authMode: "AMAZON_COGNITO_USER_POOLS"
    });
    console.log('Updated ToDo:', updatedTodo);
    fetchTodos(); // Refresh the ToDo list
  } catch (error) {
    console.error('Error updating todo:', error);
  }
}

// Delete a ToDo
async function deleteExistingTodo() {
  try {
  	const todoId = this.getAttribute("todoid");
  	await AppSyncClient.graphql({
      query: deleteTodo,
      variables: {
      	input: { id: todoId }
      },
    });
    console.log('Deleted ToDo:', todoId);
    fetchTodos(); // Refresh the ToDo list
  } catch (error) {
    console.error('Error deleting todo:', error);
  }
}

function reBindEvent() {
	var updateTodoBtns = document.getElementsByClassName('btn-update-todo');
	for(var x = 0; x < updateTodoBtns.length; x++) {
		updateTodoBtns[x].removeEventListener('click', deleteExistingTodo);
		updateTodoBtns[x].addEventListener('click', deleteExistingTodo);
	}
	
}

// Render ToDos
function renderTodos(todos) {
  const todosList = document.getElementById('todos-list');
  todosList.innerHTML = ''; // Clear the existing list

  todos.forEach(todo => {
    const todoItem = document.createElement('div');
    todoItem.innerHTML = `
      <p><strong>${todo.name}</strong>: ${todo.description}</p>
      <button class="btn-update-todo" todoid="'${todo.id}'">Delete</button>
      <button todoid="'${todo.id}'" onclick="editTodoPrompt('${todo.id}', '${todo.name}', '${todo.description}')">Edit</button>
    `;
    todosList.appendChild(todoItem);
  });

  reBindEvent();
}

// Prompt user to edit a ToDo
function editTodoPrompt(todoId, currentName, currentDescription) {
  const newName = prompt('Edit ToDo Name:', currentName);
  const newDescription = prompt('Edit ToDo Description:', currentDescription);

  if (newName && newDescription) {
    updateExistingTodo(todoId, newName, newDescription);
  }
}

// FILE UPLOAD & DOWNLOAD LOGIC (same as before)
document.getElementById('upload-button').addEventListener('click', async () => {
  const fileInput = document.getElementById('fileInput');
  const file = fileInput.files[0];

  if (!file) {
    alert('Please select a file to upload.');
    return;
  }

  try {
    const result = uploadData({
	    path: file.name, 
	    // Alternatively, path: ({identityId}) => `protected/${identityId}/album/2024/1.jpg`
	    data: file,
	    options: {
	      onProgress: ({ transferredBytes, totalBytes }) => {
	        if (totalBytes) {
	          console.log(
	            `Upload progress ${
	              Math.round((transferredBytes / totalBytes) * 100)
	            } %`
	          );
	        }
	      }
	    }
	  }).result;
    console.log('File uploaded successfully:', result);
    alert('File uploaded successfully.');
  } catch (error) {
    console.error('Error uploading file:', error);
    alert(error.message);
  }
});

document.getElementById('download-button').addEventListener('click', async () => {
  const fileName = document.getElementById('download-filename').value;

  if (!fileName) {
    alert('Please enter a file name.');
    return;
  }

  try {
    const getUrlResult = await getUrl({
		  path: fileName,
		  // Alternatively, path: ({identityId}) => `protected/${identityId}/album/2024/1.jpg`
		  options: {
		    validateObjectExistence: true,  // Check if object exists before creating a URL
		    expiresIn: 300 // validity of the URL, in seconds. defaults to 900 (15 minutes) and maxes at 3600 (1 hour)
		  },
		});
		console.log('signed URL: ', getUrlResult.url);
		console.log('URL expires at: ', getUrlResult.expiresAt);
    document.getElementById('file-url').textContent = `File URL: ${getUrlResult.url}`;
  } catch (error) {
    console.error('Error getting file:', error);
    alert(error.message);
  }
});
