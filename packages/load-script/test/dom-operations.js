/**
 * @jest-environment jsdom
 */

import { createScriptElement } from '../src/dom-operations';

describe( 'loadScript/dom-operations', () => {
	describe( 'createScriptElement()', () => {
		test( 'createScriptElement creates script tag', () => {
			const url = 'https://example.com/';
			const script = createScriptElement( url );

			expect( script.src ).toBe( url );
			expect( script.type ).toBe( 'text/javascript' );
			expect( script.async ).toBe( true );
		} );

		test( 'createScriptElement creates script tag with optional arguments', () => {
			const url = 'https://example.com/';
			const args = { id: 'scriptId', async: false };

			const script = createScriptElement( url, args );

			expect( script.src ).toBe( url );
			expect( script.id ).toBe( args.id );
			expect( script.async ).toBe( false );
		} );

		test( 'createScriptElement sets data attributes as attributes', () => {
			const url = 'https://example.com/';
			const args = {
				'data-apikey': 'secret-api-key',
				'data-challenge-container': '#blackbox-root',
			};

			const script = createScriptElement( url, args );

			expect( script.getAttribute( 'data-apikey' ) ).toBe( args[ 'data-apikey' ] );
			expect( script.getAttribute( 'data-challenge-container' ) ).toBe(
				args[ 'data-challenge-container' ]
			);
		} );
	} );
} );
