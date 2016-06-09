/**
 * Used for running mocha directly – allows integration with tooling such as Webstorm
 * $ NODE_ENV=test NODE_PATH=client:test node_modules/.bin/mocha test/run-mocha.js
 */

require( 'babel-register' );
const boot = require( './boot-test' );
before( boot.before );
after( boot.after );
require( './load-suite.js' );
