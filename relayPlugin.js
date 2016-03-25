var getbabelRelayPlugin = require('babel-relay-plugin');
var schema = require('./server/relay/schema.json');
module.exports = getbabelRelayPlugin(schema.data);
