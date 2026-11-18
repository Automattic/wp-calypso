import { vi } from 'vitest';
import {
	createExPlatClient as createBrowserExPlatClient,
	createSsrSafeDummyExPlatClient,
} from '../create-explat-client';
import { setBrowserContext, setSsrContext } from '../internal/test-common';

beforeEach( () => {
	vi.resetModules();
} );

describe( 'index.ts', () => {
	it( 'should return the real client when run in a browser context', async () => {
		setBrowserContext();
		const exPlatIndex = await import( '../index' );
		expect( exPlatIndex.createExPlatClient.toString() ).toBe(
			createBrowserExPlatClient.toString()
		);
	} );

	it( 'should return the mock client when run outside of a browser context', async () => {
		setSsrContext();
		const exPlatIndex = await import( '../index' );
		expect( exPlatIndex.createExPlatClient.toString() ).toBe(
			createSsrSafeDummyExPlatClient.toString()
		);
	} );
} );
