/**
 * @jest-environment jsdom
 */

import { loadScript } from '../src';
import { removeAllScriptCallbacks } from '../src/callback-handler';

describe( 'loadScript promise API', () => {
	afterEach( () => {
		removeAllScriptCallbacks();
		// Clean up any injected script elements.
		document.head.querySelectorAll( 'script' ).forEach( ( el ) => el.remove() );
	} );

	function getInjectedScript( url ) {
		return document.head.querySelector( `script[src="${ url }"]` );
	}

	test( 'should resolve when the script loads successfully', async () => {
		const url = 'https://example.com/script.js';
		const promise = loadScript( url );

		const script = getInjectedScript( url );
		expect( script ).not.toBeNull();

		// Simulate browser firing onload.
		script.onload( { target: script } );

		await expect( promise ).resolves.toBeUndefined();
	} );

	test( 'should reject when the script fails to load', async () => {
		const url = 'https://example.com/bad-script.js';
		const promise = loadScript( url );

		const script = getInjectedScript( url );
		script.onerror( { target: script } );

		await expect( promise ).rejects.toThrow( `Failed to load script "${ url }"` );
	} );

	test( 'should not create a second script element for the same URL', () => {
		const url = 'https://example.com/dedup.js';

		loadScript( url );
		loadScript( url );

		const scripts = document.head.querySelectorAll( `script[src="${ url }"]` );
		expect( scripts ).toHaveLength( 1 );
	} );

	test( 'should resolve both promises when the same URL is requested concurrently', async () => {
		const url = 'https://example.com/concurrent.js';

		const promise1 = loadScript( url );
		const promise2 = loadScript( url );

		const script = getInjectedScript( url );
		script.onload( { target: script } );

		await expect( promise1 ).resolves.toBeUndefined();
		await expect( promise2 ).resolves.toBeUndefined();
	} );
} );
