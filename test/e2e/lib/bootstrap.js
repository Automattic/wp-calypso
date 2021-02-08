const { expect } = require( 'chai' );
const _ = require( 'lodash' );

/* create the global variable by using lodash function */
const globalVariables = _.pick( global, [ 'expect' ] );

/* call the before for puppeteer for execute this code before start testing */
before( async () => {
	global.expect = expect;
} );

/* call the function after puppeteer done testing */
after( () => {
	global.expect = globalVariables.expect;
} );
