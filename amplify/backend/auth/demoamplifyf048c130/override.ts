import { AmplifyAuthCognitoStackTemplate, AmplifyProjectInfo } from '@aws-amplify/cli-extensibility-helper';

export function override(resources: AmplifyAuthCognitoStackTemplate, amplifyProjectInfo: AmplifyProjectInfo) {
  const alamat1Attribute = {
    attributeDataType: 'String',
    developerOnlyAttribute: false,
    mutable: true,
    name: 'alamat1',
    required: false,
  };

  const alamat2Attribute = {
    attributeDataType: 'String',
    developerOnlyAttribute: false,
    mutable: true,
    name: 'alamat2',
    required: false,
  };

  resources.userPool.schema = [
    // ...(resources.userPool.schema as any[]), // Carry over existing attributes (example: email)
    alamat1Attribute,
    alamat2Attribute,
  ]
}
