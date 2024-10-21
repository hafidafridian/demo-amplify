/**
 * @fileoverview
 *
 * This CloudFormation Trigger creates a handler which awaits the other handlers
 * specified in the `MODULES` env var, located at `./${MODULE}`.
 */

/**
 * The names of modules to load are stored as a comma-delimited string in the
 * `MODULES` env var.
 */
const moduleNames = process.env.MODULES.split(',');
/**
 * The array of imported modules.
 */
const modules = moduleNames.map((name) => require(`./${name}`));

/**
 * This async handler iterates over the given modules and awaits them.
 *
 * @see https://docs.aws.amazon.com/lambda/latest/dg/nodejs-handler.html#nodejs-handler-async
 * @type {import('@types/aws-lambda').APIGatewayProxyHandler}
 *
 */
exports.handler = async (event, context) => {
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
