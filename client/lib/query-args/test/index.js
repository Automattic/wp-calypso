import page from 'page';
import useQueryArgs from '../index';

jest.mock( 'react' );
jest.mock( 'page' );

describe( '#useQueryArgs', () => {
	const queryArgs = useQueryArgs();

	global.window = {
		location: {
			href: '',
		},
	};

	test( 'should remove the query if search is empty', () => {
		global.window.location.pathname = '/read/search';
		global.window.location.href = 'https://wordpress.com/read/search?q=test';
		const expectedResult = '/read/search';
		queryArgs.setQueryArgs();

		expect( page.replace ).toBeCalledWith( expectedResult );
	} );

	test( 'should navigate to original url if there is no search', () => {
		global.window.location.pathname = '/plugins';
		global.window.location.href = 'https://wordpress.com/plugins';
		queryArgs.setQueryArgs();

		expect( page.replace ).toBeCalledWith( '/plugins' );
	} );

	test( 'should replace current query with new one even when using custom query key', () => {
		global.window.location.pathname = '/read/search';
		global.window.location.href = 'https://wordpress.com/read/search?q=test';
		const expectedResult = '/read/search?q=reader+is+super+awesome';
		const newSearchTerm = 'reader is super awesome';

		queryArgs.setQueryArgs( { q: newSearchTerm } );

		expect( page.replace ).toHaveBeenLastCalledWith( expectedResult );
	} );

	test( 'should navigate to a page without a query search', () => {
		global.window.location.pathname = '/';
		global.window.location.href = 'https://wordpress.com';
		queryArgs.setQueryArgs();

		expect( page.replace ).toBeCalledWith( '/' );
	} );

	test( 'should replace page url on a query search', () => {
		global.window.location.pathname = '/';
		const baseUrl = 'https://wordpress.com';
		global.window.location.href = baseUrl + '?s=test';

		const newSearchTerm = 'replaced-search-term';
		const expectedUrl = '/?s=' + newSearchTerm;

		queryArgs.setQueryArgs( { s: newSearchTerm } );

		expect( page.replace ).toHaveBeenLastCalledWith( expectedUrl );
	} );

	test( 'searchTerm should contain the last searchTerm performed on setQueryArgs', () => {
		const baseUrl = 'https://wordpress.com/plugins';
		const newSearchTerm = 'replaced-search-term';
		global.window.location.pathname = '/';
		global.window.location.href = baseUrl + '?s=' + newSearchTerm;

		queryArgs.setQueryArgs( newSearchTerm );
		expect( queryArgs.getQueryArgs() ).toEqual( { s: 'replaced-search-term' } );
	} );
} );
