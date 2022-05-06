import page from 'page';
import { useState } from 'react';
import useUrlSearch, { buildSearchUrl } from '../use-url-search';

jest.mock( 'react' );
jest.mock( 'page' );

describe( '#buildSearchUrl', () => {
	test( 'should return original url if there is no search', () => {
		const uri = 'https://wordpress.com/plugins';
		expect( buildSearchUrl( uri ) ).toBe( '/plugins' );
	} );

	test( 'should add add the default params of s to built query', () => {
		const uri = 'https://wordpress.com';
		const search = 'hello';
		const expectedResult = '?s=hello';
		expect( buildSearchUrl( uri, search ) ).toBe( expectedResult );
	} );

	test( 'should replace current query with new one even when using custom query key', () => {
		const uri = 'https://wordpress.com/read/search?q=reader+is+awesome';
		const search = 'reader is super awesome';
		const queryKey = 'q';
		const expectedResult = '/read/search?q=reader+is+super+awesome';
		expect( buildSearchUrl( uri, search, queryKey ) ).toBe( expectedResult );
	} );

	test( 'should remove the query if search is empty', () => {
		const uri = 'https://wordpress.com/read/search?q=reader+is+awesome';
		const queryKey = 'q';
		const expectedResult = '/read/search';
		expect( buildSearchUrl( uri, '', queryKey ) ).toBe( expectedResult );
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
		global.window.location.href = 'https://wordpress.com';
		page.mockImplementation( jest.fn() );
		urlSearchHook.doSearch( '' );

		expect( mockSetSearchOpen ).toBeCalledWith( false );
		expect( page ).toBeCalledWith( '/' );
	} );

	test( 'should replace page url on a query search', () => {
		const baseUrl = 'https://wordpress.com';
		global.window.location.href = baseUrl + '?s=test';

		const newSearchTerm = 'replaced-search-term';
		const expectedUrl = '?s=' + newSearchTerm;

		page.replace.mockImplementation( () => {} );
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
