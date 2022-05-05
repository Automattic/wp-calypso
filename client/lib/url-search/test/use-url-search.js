import { useState } from '@wordpress/element';
import page from 'page';
import useUrlSearch, { buildSearchUrl } from '../use-url-search';

jest.mock( '@wordpress/element' );
jest.mock( 'page' );

describe( '#buildSearchUrl', () => {
	test( 'should return original url if there is no search', () => {
		const params = { uri: 'chicken.com' };
		expect( buildSearchUrl( params ) ).toBe( 'chicken.com' );
	} );

	test( 'should add add the default params of s to built query', () => {
		const params = {
			uri: 'google.com',
			search: 'hello',
		};
		const expectedResult = 'google.com?s=hello';
		expect( buildSearchUrl( params ) ).toBe( expectedResult );
	} );

	test( 'should replace current query with new one even when using custom query key', () => {
		const params = {
			uri: 'wordpress.com/read/search?q=reader+is+awesome',
			search: 'reader is super awesome',
			queryKey: 'q',
		};
		const expectedResult = 'wordpress.com/read/search?q=reader+is+super+awesome';
		expect( buildSearchUrl( params ) ).toBe( expectedResult );
	} );

	test( 'should remove the query if search is empty', () => {
		const params = {
			uri: 'wordpress.com/read/search?q=reader+is+awesome',
			queryKey: 'q',
		};
		const expectedResult = 'wordpress.com/read/search';
		expect( buildSearchUrl( params ) ).toBe( expectedResult );
	} );
} );

describe( '#useUrlSearch', () => {
	const mockSetSearchOpen = jest.fn();
	const mockIsSearchOpen = false;

	const useStateMock = () => [ mockIsSearchOpen, mockSetSearchOpen ];
	useState.mockImplementation( useStateMock );
	const urlSearchHook = useUrlSearch();

	global.window = {
		location: {
			href: '',
		},
	};

	test( 'should navigate to a page without a query search', () => {
		global.window.location.href = 'wordpress.com';
		page.mockImplementation( jest.fn() );
		urlSearchHook.doSearch( '' );

		expect( mockSetSearchOpen ).toBeCalledWith( false );
		expect( page ).toBeCalledWith( global.window.location.href );
	} );

	test( 'should replace page url on a query search', () => {
		const baseUrl = 'wordpress.com';
		global.window.location.href = baseUrl + '?s=test';

		const newSearchTerm = 'replaced-search-term';
		const expectedUrl = baseUrl + '?s=' + newSearchTerm;

		page.replace.mockImplementation( () => {} );
		urlSearchHook.doSearch( newSearchTerm );

		expect( mockSetSearchOpen ).toHaveBeenLastCalledWith( true );
		expect( page.replace ).toHaveBeenLastCalledWith( expectedUrl );
	} );

	test( 'should return the correct values for getSearchOpen accordingly to isSearchOpen and queryKey values', () => {
		useState.mockImplementation( () => [ false, () => {} ] );
		expect( useUrlSearch( '' ).getSearchOpen() ).toBe( false );

		useState.mockImplementation( () => [ true, () => {} ] );
		expect( useUrlSearch( '' ).getSearchOpen() ).toBe( true );

		useState.mockImplementation( () => [ false, () => {} ] );
		expect( useUrlSearch( 's' ).getSearchOpen() ).toBe( true );
	} );
} );
