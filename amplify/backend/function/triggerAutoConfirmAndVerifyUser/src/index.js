export const handler = async (event) => {
  // Automatically confirm the user
  event.response.autoConfirmUser = true;

  // Automatically verify the email if provided in the request
  if (event.request.userAttributes.hasOwnProperty('email')) {
    event.response.autoVerifyEmail = true;
  }

  // Automatically verify the phone number if provided in the request
  // if (event.request.userAttributes.hasOwnProperty('phone_number')) {
  //   event.response.autoVerifyPhone = true;
  // }

  // Return the event back to Amazon Cognito
  return event;
};