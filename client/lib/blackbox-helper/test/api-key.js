/**
 * @jest-environment jsdom
 */

import {
	getBlackboxDevApiKeyOverride,
	resolveBlackboxApiKey,
	setBlackboxDevApiKeyOverride,
} from '../api-key';

describe( 'blackbox-helper/api-key', () => {
	const originalNodeEnv = process.env.NODE_ENV;
	const reload = jest.fn();

	beforeAll( () => {
		Object.defineProperty( window, 'location', {
			configurable: true,
			value: { reload },
		} );
	} );

	beforeEach( () => {
		window.sessionStorage.clear();
		reload.mockClear();
	} );

	afterAll( () => {
		process.env.NODE_ENV = originalNodeEnv;
	} );

	test( 'resolveBlackboxApiKey returns config key outside development', () => {
		process.env.NODE_ENV = 'production';
		setBlackboxDevApiKeyOverride( 'challenge' );

		expect( resolveBlackboxApiKey( 'prod-key' ) ).toBe( 'prod-key' );
	} );

	test( 'resolveBlackboxApiKey returns the selected test key in development', () => {
		process.env.NODE_ENV = 'development';
		setBlackboxDevApiKeyOverride( 'challenge' );

		expect( resolveBlackboxApiKey( 'prod-key' ) ).toBe( '3xAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA' );
	} );

	test( 'resolveBlackboxApiKey falls back to config key when override is default', () => {
		process.env.NODE_ENV = 'development';

		expect( resolveBlackboxApiKey( 'prod-key' ) ).toBe( 'prod-key' );
	} );

	test( 'setBlackboxDevApiKeyOverride persists the override and reloads', () => {
		setBlackboxDevApiKeyOverride( 'allow' );

		expect( getBlackboxDevApiKeyOverride() ).toBe( 'allow' );
		expect( reload ).toHaveBeenCalled();
	} );

	test( 'setBlackboxDevApiKeyOverride clears the override when set back to default', () => {
		setBlackboxDevApiKeyOverride( 'block' );
		setBlackboxDevApiKeyOverride( 'default' );

		expect( getBlackboxDevApiKeyOverride() ).toBe( 'default' );
	} );

	test( 'setBlackboxDevApiKeyOverride ignores invalid values', () => {
		setBlackboxDevApiKeyOverride( 'not-valid' );

		expect( getBlackboxDevApiKeyOverride() ).toBe( 'default' );
		expect( reload ).not.toHaveBeenCalled();
	} );

	test( 'getBlackboxDevApiKeyOverride ignores invalid stored values', () => {
		window.sessionStorage.setItem( 'blackbox-dev-api-key-override', 'not-valid' );

		expect( getBlackboxDevApiKeyOverride() ).toBe( 'default' );
	} );
} );
