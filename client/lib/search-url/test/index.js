import page from 'page';
import searchUrl from '..';

const SEARCH_KEYWORD = 'giraffe';

describe( 'SearchUrl', () => {
	let onSearch;
	let onReplace;
	let onPage;

	beforeEach( () => {
		onSearch = jest.fn();
		onReplace = jest.spyOn( page, 'replace' );
		onPage = jest.spyOn( page, 'show' );
	} );

	test( 'should call onSearch if provided', () => {
		searchUrl( SEARCH_KEYWORD, '', onSearch );

		expect( onSearch ).toBeCalledWith( SEARCH_KEYWORD );
	} );

	test( 'should replace existing search keyword', () => {
		global.window = { location: { href: 'http://example.com/cat' } };

		searchUrl( SEARCH_KEYWORD, 'existing' );

		expect( onReplace ).toBeCalledWith( '/cat?s=' + SEARCH_KEYWORD );
	} );

	test( 'should set page URL if no existing keyword', () => {
		global.window = { location: { href: 'http://example.com/cat' } };

		searchUrl( SEARCH_KEYWORD );

		expect( onPage ).toBeCalledWith( '/cat?s=' + SEARCH_KEYWORD );
	} );
} );
