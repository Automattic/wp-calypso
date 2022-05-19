import page from 'page';
import { useState } from 'react';
import useUrlSearch from '../use-url-search';

jest.mock( 'react' );
jest.mock( 'page' );

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

	test( 'should remove the query if search is empty', () => {
		global.window.location.href = 'https://wordpress.com/read/search?q=test';
		const expectedResult = '/read/search';
		urlSearchHook.doSearch( '' );

		expect( page ).toBeCalledWith( expectedResult );
	} );

	test( 'should navigate to original url if there is no search', () => {
		global.window.location.href = 'https://wordpress.com/plugins';
		urlSearchHook.doSearch( '' );

		expect( mockSetSearchOpen ).toBeCalledWith( false );
		expect( page ).toBeCalledWith( '/plugins' );
	} );

	test( 'should replace current query with new one even when using custom query key', () => {
		global.window.location.href = 'https://wordpress.com/read/search?q=test';
		const expectedResult = '/read/search?q=reader+is+super+awesome';
		const newSearchTerm = 'reader is super awesome';

		const urlSearchHook2 = useUrlSearch( 'q' );
		urlSearchHook2.doSearch( newSearchTerm );

		expect( page.replace ).toHaveBeenLastCalledWith( expectedResult );
	} );

	test( 'should navigate to a page without a query search', () => {
		global.window.location.href = 'https://wordpress.com';
		urlSearchHook.doSearch( '' );

		expect( mockSetSearchOpen ).toBeCalledWith( false );
		expect( page ).toBeCalledWith( '/' );
	} );

	test( 'should replace page url on a query search', () => {
		const baseUrl = 'https://wordpress.com';
		global.window.location.href = baseUrl + '?s=test';

		const newSearchTerm = 'replaced-search-term';
		const expectedUrl = '?s=' + newSearchTerm;

		urlSearchHook.doSearch( newSearchTerm );

		expect( mockSetSearchOpen ).toHaveBeenLastCalledWith( true );
		expect( page.replace ).toHaveBeenLastCalledWith( expectedUrl );
	} );

	test( 'searchTerm should contain the last searchTerm performed on doSearch', () => {
		const newSearchTerm = 'replaced-search-term';
		const mockSetSearch = jest.fn();
		useState.mockImplementation( () => [ newSearchTerm, mockSetSearch ] );

		const urlSearchHook2 = useUrlSearch();
		urlSearchHook2.doSearch( newSearchTerm );

		expect( mockSetSearch ).toBeCalledWith( newSearchTerm );
		expect( urlSearchHook2.searchTerm ).toBe( 'replaced-search-term' );
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
