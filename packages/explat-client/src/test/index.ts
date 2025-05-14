import {
	createExPlatClient as createBrowserExPlatClient,
	createSsrSafeDummyExPlatClient,
} from '../create-explat-client';
import { setBrowserContext, setSsrContext } from '../internal/test-common';

beforeEach( () => {
	jest.resetModules();
} );

describe( 'index.ts', () => {
	it( 'should return the real client when run in a browser context', () => {
		setBrowserContext();
		const exPlatIndex = require( '../index' );
		expect( exPlatIndex.createExPlatClient.toString() ).toBe(
			createBrowserExPlatClient.toString()
		);
	} );

	it( 'should return the mock client when run outside of a browser context', () => {
		setSsrContext();
		const exPlatIndex = require( '../index' );
		expect( exPlatIndex.createExPlatClient.toString() ).toBe(
			createSsrSafeDummyExPlatClient.toString()
		);
	} );
} );
