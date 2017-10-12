/** @format */
/**
 * External dependencies
 */
import { spy } from 'sinon';

/**
 * Internal dependencies
 */
import WPorgActions from 'lib/plugins/wporg-data/actions';
import mockedWporg from 'lib/wporg';
jest.mock( 'lib/wporg', () => require( './mocks/wporg' ) );
jest.mock( 'lib/impure-lodash', () => ( {
	debounce: cb => cb,
} ) );

describe( 'WPorg Data Actions', () => {
	beforeEach( () => {
		WPorgActions.reset();
		mockedWporg.reset();
	} );

	test( 'Actions should be an object', () => {
		expect( typeof WPorgActions ).toBe( 'object' );
	} );

	test( 'Actions should have method fetchPluginsList', () => {
		expect( typeof WPorgActions.fetchPluginsList ).toBe( 'function' );
	} );

	test( 'Actions should have method fetchCuratedList', () => {
		expect( typeof WPorgActions.fetchCuratedList ).toBe( 'function' );
	} );

	test( 'Actions should have method fetchNextCategoryPage', () => {
		expect( typeof WPorgActions.fetchNextCategoryPage ).toBe( 'function' );
	} );

	test( "when fetching a plugin list, it shouldn't do the wporg request if there's a previous one still not finished for the same category", () => {
		mockedWporg.deactivatedCallbacks = true;
		WPorgActions.fetchPluginsList( 'new', 1 );
		WPorgActions.fetchPluginsList( 'new', 1 );
		expect( mockedWporg.getActivity().fetchPluginsList ).toEqual( 1 );
	} );

	test( 'should return our Calypso curated feature list', () => {
		const curatedSpy = spy( WPorgActions, 'fetchCuratedList' );
		WPorgActions.fetchPluginsList( 'featured', 1 );
		expect( curatedSpy.called ).toBe( true );
	} );

	test( 'does not return the community featured list', () => {
		WPorgActions.fetchPluginsList( 'featured', 1 );
		expect( mockedWporg.getActivity().fetchPluginsList ).toEqual( 0 );
	} );

	test( 'when fetching for the next page, the next page number should be calculated automatically', () => {
		WPorgActions.fetchPluginsList( 'new', 1 );
		WPorgActions.fetchNextCategoryPage( 'new' );
		expect( mockedWporg.getActivity().lastRequestParams.page ).toEqual( 2 );
	} );

	test( 'when fetching for the next page, it should do a request if the next page is not over the number of total pages', () => {
		WPorgActions.fetchPluginsList( 'new', 1 );
		WPorgActions.fetchNextCategoryPage( 'new' );
		expect( mockedWporg.getActivity().fetchPluginsList ).toEqual( 2 );
	} );

	test( 'when fetching for the next page, it should not do any request if the next page is over the number of total pages', () => {
		mockedWporg.mockedNumberOfReturnedPages = 1;
		WPorgActions.fetchPluginsList( 'new', 1 );
		WPorgActions.fetchNextCategoryPage( 'new' );
		expect( mockedWporg.getActivity().fetchPluginsList ).toEqual( 1 );
	} );
} );
