import { getSpacePath, getSpaceTabPath, parseSpaceTab, parseSpaceTabFromPath } from '../routes';

describe( 'spaces routes', () => {
	describe( 'getSpacePath', () => {
		it( 'builds the base path from an ASCII slug', () => {
			expect( getSpacePath( 'my-space' ) ).toBe( '/reader/spaces/my-space' );
		} );

		it( 'does not double-encode an already percent-encoded (non-Latin) slug', () => {
			// `sanitize_title` percent-encodes non-Latin titles, so the slug arrives
			// pre-encoded; re-encoding would turn each `%` into `%25`.
			const slug = '%d0%bf%d1%80%d0%b8%d0%b2%d0%b5%d1%82'; // "привет"
			expect( getSpacePath( slug ) ).toBe( `/reader/spaces/${ slug }` );
			expect( getSpacePath( slug ) ).not.toContain( '%25' );
		} );
	} );

	describe( 'getSpaceTabPath', () => {
		it( 'returns the bare base path for the feed tab', () => {
			expect( getSpaceTabPath( 'work', 'feed' ) ).toBe( '/reader/spaces/work' );
		} );

		it( 'appends the tab slug for a non-feed tab', () => {
			expect( getSpaceTabPath( 'work', 'discover' ) ).toBe( '/reader/spaces/work/discover' );
		} );
	} );

	describe( 'parseSpaceTab', () => {
		it( 'treats a missing tab as the canonical feed', () => {
			expect( parseSpaceTab( undefined ) ).toBe( 'feed' );
		} );

		it( 'accepts discover and rejects other suffixes (including an explicit feed)', () => {
			expect( parseSpaceTab( 'discover' ) ).toBe( 'discover' );
			expect( parseSpaceTab( 'feed' ) ).toBeNull();
			expect( parseSpaceTab( 'bogus' ) ).toBeNull();
		} );
	} );

	describe( 'parseSpaceTabFromPath', () => {
		it( 'reads the tab out of a full space path', () => {
			expect( parseSpaceTabFromPath( '/reader/spaces/work/discover' ) ).toBe( 'discover' );
		} );

		it( 'falls back to feed for the base path, an unknown suffix, or an empty route', () => {
			expect( parseSpaceTabFromPath( '/reader/spaces/work' ) ).toBe( 'feed' );
			expect( parseSpaceTabFromPath( '/reader/spaces/work/bogus' ) ).toBe( 'feed' );
			expect( parseSpaceTabFromPath( '' ) ).toBe( 'feed' );
		} );

		it( 'ignores a query string when reading the tab', () => {
			expect( parseSpaceTabFromPath( '/reader/spaces/work/discover?ref=x' ) ).toBe( 'discover' );
		} );
	} );
} );
