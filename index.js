const AWS = require('aws-sdk');
const ConditionalQueryBuilder = require('./lib/ConditionalQueryBuilder');

const getPromise = func => (method, params) => new Promise((resolve, reject) => {
  func[method](params, (err, data) => (err ? reject(err) : resolve(data)));
});

// Exports DynamoDB function that returns an object of methods
module.exports = (region = 'eu-central-1', config) => {

  var dynamoDB, configObj;

  if (typeof config === 'string') {
    configObj = Object.assign(JSON.parse(require('fs').readFileSync(config, 'utf8')), { region: region } );
  } else if (typeof config === 'object') {
    configObj = Object.assign(config, { region: region })
  } else {
    // This will force using STS as fallback credentials provider
    if (!configObj) configObj = new AWS.ECSCredentials();
    if (!configObj) configObj = new AWS.SharedIniFileCredentials();
    if (!configObj) configObj = new AWS.EnvironmentCredentials('AWS');
  }

  dynamoDB = new AWS.DynamoDB( configObj );

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
