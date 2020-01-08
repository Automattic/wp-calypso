/**
 * @jest-environment jsdom
 */

let oldURL;

describe( 'determineUrlType', () => {
	beforeAll( () => {
		oldURL = URL;
		// Force polyfill
		global.forceJURL = true;
		require( '@webcomponents/url' );
	} );

	afterAll( () => {
		global.URL = oldURL;
		delete global.forceJURL;
	} );

	const { determineUrlType } = require( '../url-type' );
	const runTests = require( './common/url-type.skip' );
	runTests( determineUrlType );
} );
