import {
	MAX_CATEGORY_PAGE,
	getCategoryPage,
	getCategoryPageUrl,
	getCategoryPaginationUrls,
	parseCategoryPage,
} from '../category-pagination';

describe( 'parseCategoryPage', () => {
	test.each( [
		[ '1', 1 ],
		[ '12', 12 ],
		[ undefined, null ],
		[ '', null ],
		[ '0', null ],
		[ '-1', null ],
		[ '01', null ],
		[ '1.5', null ],
		[ 'two', null ],
		[ [ '2', '3' ], null ],
	] )( 'parses %p as %p', ( value, expected ) => {
		expect( parseCategoryPage( value ) ).toBe( expected );
	} );
} );

describe( 'getCategoryPage', () => {
	test( 'falls back to the first page for a missing, invalid or out-of-window page', () => {
		expect( getCategoryPage( undefined ) ).toBe( 1 );
		expect( getCategoryPage( 'abc' ) ).toBe( 1 );
		expect( getCategoryPage( String( MAX_CATEGORY_PAGE + 1 ) ) ).toBe( 1 );
	} );

	test( 'returns a valid page', () => {
		expect( getCategoryPage( '4' ) ).toBe( 4 );
		expect( getCategoryPage( String( MAX_CATEGORY_PAGE ) ) ).toBe( MAX_CATEGORY_PAGE );
	} );
} );

describe( 'getCategoryPageUrl', () => {
	test( 'keeps the first page on the bare pathname', () => {
		expect( getCategoryPageUrl( '/plugins/browse/seo', 1 ) ).toBe( '/plugins/browse/seo' );
	} );

	test( 'adds the page query arg past the first page', () => {
		expect( getCategoryPageUrl( '/es/plugins/browse/seo', 3 ) ).toBe(
			'/es/plugins/browse/seo?page=3'
		);
	} );
} );

describe( 'getCategoryPaginationUrls', () => {
	const pathname = '/plugins/browse/seo';

	test( 'has no previous page on the first page', () => {
		expect( getCategoryPaginationUrls( { pathname, page: 1, hasNextPage: true } ) ).toEqual( {
			prev: null,
			next: '/plugins/browse/seo?page=2',
		} );
	} );

	test( 'has no next page when the search has no more results', () => {
		expect( getCategoryPaginationUrls( { pathname, page: 2, hasNextPage: false } ) ).toEqual( {
			prev: '/plugins/browse/seo',
			next: null,
		} );
	} );

	test( 'points the next page past the pages infinite scroll has loaded', () => {
		expect(
			getCategoryPaginationUrls( { pathname, page: 3, loadedPages: 4, hasNextPage: true } )
		).toEqual( {
			prev: '/plugins/browse/seo?page=2',
			next: '/plugins/browse/seo?page=7',
		} );
	} );

	test( 'stops at the last page the search can return', () => {
		expect(
			getCategoryPaginationUrls( { pathname, page: MAX_CATEGORY_PAGE, hasNextPage: true } ).next
		).toBeNull();
	} );
} );
