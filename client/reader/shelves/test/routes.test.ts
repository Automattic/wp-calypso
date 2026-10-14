import { getShelfPath, getShelfTabPath, parseShelfTab, parseShelfTabFromPath } from '../routes';

describe( 'shelves routes', () => {
	describe( 'getShelfPath', () => {
		it( 'builds the base path from an ASCII slug', () => {
			expect( getShelfPath( 'my-shelf' ) ).toBe( '/reader/shelves/my-shelf' );
		} );

		it( 'does not double-encode an already percent-encoded (non-Latin) slug', () => {
			// `sanitize_title` percent-encodes non-Latin titles, so the slug arrives
			// pre-encoded; re-encoding would turn each `%` into `%25`.
			const slug = '%d0%bf%d1%80%d0%b8%d0%b2%d0%b5%d1%82'; // "привет"
			expect( getShelfPath( slug ) ).toBe( `/reader/shelves/${ slug }` );
			expect( getShelfPath( slug ) ).not.toContain( '%25' );
		} );
	} );

	describe( 'getShelfTabPath', () => {
		it( 'returns the bare base path for the feed tab', () => {
			expect( getShelfTabPath( 'work', 'feed' ) ).toBe( '/reader/shelves/work' );
		} );

		it( 'appends the tab slug for a non-feed tab', () => {
			expect( getShelfTabPath( 'work', 'discover' ) ).toBe( '/reader/shelves/work/discover' );
		} );
	} );

	describe( 'parseShelfTab', () => {
		it( 'treats a missing tab as the canonical feed', () => {
			expect( parseShelfTab( undefined ) ).toBe( 'feed' );
		} );

		it( 'accepts discover and rejects other suffixes (including an explicit feed)', () => {
			expect( parseShelfTab( 'discover' ) ).toBe( 'discover' );
			expect( parseShelfTab( 'feed' ) ).toBeNull();
			expect( parseShelfTab( 'bogus' ) ).toBeNull();
		} );
	} );

	describe( 'parseShelfTabFromPath', () => {
		it( 'reads the tab out of a full shelf path', () => {
			expect( parseShelfTabFromPath( '/reader/shelves/work/discover' ) ).toBe( 'discover' );
		} );

		it( 'falls back to feed for the base path, an unknown suffix, or an empty route', () => {
			expect( parseShelfTabFromPath( '/reader/shelves/work' ) ).toBe( 'feed' );
			expect( parseShelfTabFromPath( '/reader/shelves/work/bogus' ) ).toBe( 'feed' );
			expect( parseShelfTabFromPath( '' ) ).toBe( 'feed' );
		} );

		it( 'ignores a query string when reading the tab', () => {
			expect( parseShelfTabFromPath( '/reader/shelves/work/discover?ref=x' ) ).toBe( 'discover' );
		} );
	} );
} );
