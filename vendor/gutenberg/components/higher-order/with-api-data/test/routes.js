/**
 * Internal dependencies
 */
import {
	isRouteMatch,
	getRoute,
	getNormalizedRegExp,
} from '../routes';

describe( 'routes', () => {
	describe( 'getNormalizedRegExp()', () => {
		it( 'should strip named subpatterns', () => {
			const regexp = getNormalizedRegExp( '(?P<parent>[\\d]+)' );

			expect( '5' ).toMatch( regexp );
		} );

		it( 'should match with trailing slashes', () => {
			const regexp = getNormalizedRegExp( '/wp' );

			expect( '/wp/' ).toMatch( regexp );
		} );

		it( 'should match with query parameters slashes', () => {
			const regexp = getNormalizedRegExp( '/wp' );

			expect( '/wp?ok=true' ).toMatch( regexp );
		} );

		it( 'should otherwise be strictly equal', () => {
			const regexp = getNormalizedRegExp( '/wp' );

			expect( '/wp/notok' ).not.toMatch( regexp );
		} );
	} );

	describe( 'isRouteMatch()', () => {
		it( 'should return false for non-match', () => {
			const isMatch = isRouteMatch(
				'/wp/v2/pages/(?P<parent>[\\d]+)/revisions',
				'/wp/v2/pages/1/revisions/2'
			);

			expect( isMatch ).toBe( false );
		} );

		it( 'should return true for match', () => {
			const isMatch = isRouteMatch(
				'/wp/v2/pages/(?P<parent>[\\d]+)/revisions/(?P<id>[\\d]+)',
				'/wp/v2/pages/1/revisions/2'
			);

			expect( isMatch ).toBe( true );
		} );
	} );

	describe( 'getRoute()', () => {
		const expected = { base: {}, nested: {} };
		const schema = {
			routes: {
				'/wp/v2/pages/(?P<parent>[\\d]+)/revisions': expected.base,
				'/wp/v2/pages/(?P<parent>[\\d]+)/revisions/(?P<id>[\\d]+)': expected.nested,
			},
		};

		beforeEach( () => {
			getRoute.clear();
		} );

		it( 'should match base route with balanced match pattern', () => {
			const path = '/wp/v2/pages/1/revisions';
			const route = getRoute( schema, path );

			expect( route ).toBe( expected.base );
		} );

		it( 'should match nested route with balanced match pattern', () => {
			const path = '/wp/v2/pages/1/revisions/2';
			const route = getRoute( schema, path );

			expect( route ).toBe( expected.nested );
		} );
	} );
} );
