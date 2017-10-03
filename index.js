const AWS = require('aws-sdk');
const ConditionalQueryBuilder = require('./lib/ConditionalQueryBuilder');

const getPromise = func => (method, params) => new Promise((resolve, reject) => {
  func[method](params, (err, data) => (err ? reject(err) : resolve(data)));
});

// Exports DynamoDB function that returns an object of methods
module.exports = (region = 'eu-central-1', config) => {

  var dynamoDB, credentialsObj, configObj;
  /*
    if (typeof config === 'string') {
      configObj = Object.assign(JSON.parse(require('fs').readFileSync(config, 'utf8')),
        { region: region, sessionToken: null });
    } else if (typeof config === 'object') {
      configObj = Object.assign(config, { region: region })
    } else {
      let chain = new AWS.CredentialProviderChain()

      chain.defaultProviders = [
        function () { return new AWS.EnvironmentCredentials('AWS') },
        function () { return new AWS.SharedIniFileCredentials() },
        // function () { return new AWS.SharedIniFileCredentials({profile: 'my_profile_name'}); },
        function () { return new AWS.EC2MetadataCredentials() }
      ]

      chain.resolve((err, cred) => {
        // console.log('cred', cred, err)
        if (!err) {
          credentialsObj = cred
          configObj = { accessKeyId: credentialsObj.accessKeyId, sessionToken: credentialsObj.sessionToken }
        }
      })
    }
  */
  AWS.config.update({ region: region })
  // https://docs.aws.amazon.com/AWSJavaScriptSDK/latest/AWS/DynamoDB.html#constructor-property
  dynamoDB = new AWS.DynamoDB();

  if (!dynamoDB.config.credentials) {
    throw new Error('Can not load AWS credentials');
  }

  const docClient = new AWS.DynamoDB.DocumentClient();
  const db = getPromise(dynamoDB);
  const doc = getPromise(docClient);

  return {
    config: dynamoDB.config,

    // Select Table and return method object for further queries
    select: TableName => new ConditionalQueryBuilder(TableName, {
    docClient,
    doc,
    db,
  }),

    createSet: params => docClient.createSet(params),
};
};
