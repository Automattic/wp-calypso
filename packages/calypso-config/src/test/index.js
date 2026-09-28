/**
 * @jest-environment jsdom
 */

describe( 'optionalConfig', () => {
	let optionalConfig;

	beforeAll( () => {
		window.configData = { name: 'Ada', greeting: 'Hi {{name}}' };
		jest.isolateModules( () => {
			( { optionalConfig } = require( '../' ) );
		} );
	} );

	test( 'returns undefined for a key the page did not print, without the console error config() logs', () => {
		const consoleError = jest.spyOn( console, 'error' ).mockImplementation( () => {} );

		expect( optionalConfig( 'jetpack_version' ) ).toBeUndefined();
		expect( consoleError ).not.toHaveBeenCalled();

		consoleError.mockRestore();
	} );

	test( 'resolves templates in a key it finds, like config() does', () => {
		expect( optionalConfig( 'greeting' ) ).toBe( 'Hi Ada' );
	} );
} );
