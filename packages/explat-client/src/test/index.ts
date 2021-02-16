/**
 * External dependencies
 */
// This is required to fix the "regeneratorRuntime is not defined" error
import '@automattic/calypso-polyfills';

/**
 * Internal dependencies
 */
import {
	createExPlatClient as createBrowserExPlatClient,
	createSsrSafeDummyExPlatClient,
} from '../create-explat-client';

beforeEach( () => {
	jest.resetModules();
} );

describe( 'index.ts', () => {
	it( 'should return the real client when run in a browser context', () => {
		// eslint-disable-next-line @typescript-eslint/ban-ts-comment
		// @ts-ignore
		global.window = {};
		const exPlatIndex = require( '../index' );
		expect( exPlatIndex.createExPlatClient.toString() ).toBe(
			createBrowserExPlatClient.toString()
		);
	} );

	it( 'should return the mock client when run outside of a browser context', () => {
		// eslint-disable-next-line @typescript-eslint/ban-ts-comment
		// @ts-ignore
		global.window = undefined;
		const exPlatIndex = require( '../index' );
		expect( exPlatIndex.createExPlatClient.toString() ).toBe(
			createSsrSafeDummyExPlatClient.toString()
		);
	} );
} );
