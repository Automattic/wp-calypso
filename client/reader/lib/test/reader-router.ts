/**
 * @jest-environment jsdom
 */
import page, { createRouteRegistry } from '@automattic/calypso-router';
import { readerPage, isKnownReaderRoute } from '../reader-router';

describe( 'reader-router', () => {
	describe( 'isKnownReaderRoute', () => {
		it( 'matches recorded static and parameterized routes like page.js', () => {
			const noop = () => {};
			readerPage( '/reader/conversations', noop );
			readerPage( '/reader/feeds/:feed/posts/:post', noop );
			readerPage( '/reader/spaces/:slug/:tab', noop );

			// Known: exact static route and parameterized routes with real segments.
			expect( isKnownReaderRoute( '/reader/conversations' ) ).toBe( true );
			expect( isKnownReaderRoute( '/reader/feeds/123/posts/456' ) ).toBe( true );
			expect( isKnownReaderRoute( '/reader/spaces/design/discover' ) ).toBe( true );

			// Query strings and a trailing slash are ignored when matching.
			expect( isKnownReaderRoute( '/reader/conversations?ref=x' ) ).toBe( true );
			expect( isKnownReaderRoute( '/reader/conversations/' ) ).toBe( true );
			expect( isKnownReaderRoute( '/reader/feeds/123/posts/456/' ) ).toBe( true );

			// Unknown: deeper unmatched paths and paths no recorded route owns.
			expect( isKnownReaderRoute( '/reader/conversations/garbage' ) ).toBe( false );
			expect( isKnownReaderRoute( '/reader/feeds/123/posts/456/garbage' ) ).toBe( false );
			expect( isKnownReaderRoute( '/reader/totally-unknown' ) ).toBe( false );
		} );

		it( 'is idempotent when the same routes are re-registered (dev hot reload)', () => {
			const noop = () => {};
			readerPage( '/reader/conversations', noop );
			readerPage( '/reader/feeds/:feed/posts/:post', noop );
			readerPage( '/reader/conversations', noop );
			readerPage( '/reader/feeds/:feed/posts/:post', noop );

			expect( isKnownReaderRoute( '/reader/conversations' ) ).toBe( true );
			expect( isKnownReaderRoute( '/reader/feeds/123/posts/456' ) ).toBe( true );
			expect( isKnownReaderRoute( '/reader/unknown' ) ).toBe( false );
		} );

		it( 'records regular expression routes', () => {
			const route = /^\/reader\/regex$/;
			const noop = () => {};
			const registry = createRouteRegistry();

			expect( () => registry.page( route, noop ) ).not.toThrow();
			expect( registry.has( '/reader/regex' ) ).toBe( true );
			expect( registry.has( '/reader/regex/extra' ) ).toBe( false );
		} );

		it( 'matches using the wrapped page instance strict setting', () => {
			const router = page.create();
			router.strict( true );
			const registry = createRouteRegistry( router );

			registry.page( '/reader/strict', () => {} );

			expect( registry.has( '/reader/strict' ) ).toBe( true );
			expect( registry.has( '/reader/strict/' ) ).toBe( false );
		} );
	} );
} );
