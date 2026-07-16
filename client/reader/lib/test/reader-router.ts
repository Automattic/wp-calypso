/**
 * @jest-environment jsdom
 */
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

			expect( isKnownReaderRoute( '/reader/conversations' ) ).toBe( true );
			expect( isKnownReaderRoute( '/reader/feeds/123/posts/456' ) ).toBe( true );
			expect( isKnownReaderRoute( '/reader/unknown' ) ).toBe( false );
		} );
	} );
} );
