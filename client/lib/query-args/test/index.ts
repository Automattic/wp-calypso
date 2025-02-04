import page from '@automattic/calypso-router';
import { setQueryArgs, updateQueryArgs, getQueryArgs } from '../index';

jest.mock( 'react' );
jest.mock( '@automattic/calypso-router' );

describe( '#setQueryArgs', () => {
	global.window = { location: { href: '' } } as typeof global.window;

	test( 'should remove the query if search is empty', () => {
		global.window.location.href = 'https://wordpress.com/reader/search?q=test';
		const expectedResult = '/reader/search';
		setQueryArgs( {} );

		expect( page ).toHaveBeenCalledWith( expectedResult );
	} );

	test( 'should navigate to original url if there is no search', () => {
		global.window.location.href = 'https://wordpress.com/plugins';
		setQueryArgs( {} );

		expect( page ).toHaveBeenCalledWith( '/plugins' );
	} );

	test( 'should replace current query with new one even when using custom query key', () => {
		global.window.location.href = 'https://wordpress.com/reader/search?q=test';
		const expectedResult = '/reader/search?q=reader+is+super+awesome';
		const newSearchTerm = 'reader is super awesome';

		setQueryArgs( { q: newSearchTerm } );

		expect( page ).toHaveBeenLastCalledWith( expectedResult );
	} );

	test( 'should navigate to a page without a query search', () => {
		global.window.location.pathname = '/';
		global.window.location.href = 'https://wordpress.com';
		setQueryArgs( {} );

		expect( page ).toHaveBeenCalledWith( '/' );
	} );

	test( 'should replace page url on a query search', () => {
		const baseUrl = 'https://wordpress.com';
		global.window.location.href = baseUrl + '?s=test';

		const newSearchTerm = 'replaced-search-term';
		const expectedUrl = '/?s=' + newSearchTerm;

		setQueryArgs( { s: newSearchTerm } );

		expect( page ).toHaveBeenLastCalledWith( expectedUrl );
	} );

	test( 'searchTerm should contain the last searchTerm performed on setQueryArgs', () => {
		global.window.location.href = 'https://wordpress.com/plugins?s=search-term';
		setQueryArgs( { s: 'replaced-search-term' } );
		expect( page ).toHaveBeenLastCalledWith( '/plugins?s=replaced-search-term' );
	} );
} );

describe( '#getQueryArgs', () => {
	test( 'getQueryArgs should get the current url parameters', () => {
		global.window.location.href = 'https://wordpress.com/plugins?a=1&b=2&c=3';

		expect( getQueryArgs() ).toEqual( { a: '1', b: '2', c: '3' } );
	} );
} );

describe( '#updateQueryArgs', () => {
	test( 'getQueryArgs should get the current url parameters', () => {
		global.window.location.href = 'https://wordpress.com/plugins?a=1&b=2&c=3';

		updateQueryArgs( { a: 'replaced-value' } );

		expect( page ).toHaveBeenLastCalledWith( '/plugins?a=replaced-value&b=2&c=3' );
	} );
} );
