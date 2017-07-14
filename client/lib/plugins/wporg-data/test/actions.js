jest.mock( 'lib/wporg', () => require( './mocks/wporg' ) );
jest.mock( 'lib/impure-lodash', () => ( {
	debounce: cb => cb,
} ) );

/**
 * External dependencies
 */
import { assert } from 'chai';
import { spy } from 'sinon';

/**
 * Internal dependencies
 */
import mockedWporg from 'lib/wporg';
import WPorgActions from 'lib/plugins/wporg-data/actions';

describe( 'WPorg Data Actions', () => {
	beforeEach( () => {
		WPorgActions.reset();
		mockedWporg.reset();
	} );

	it( 'Actions should be an object', () => {
		assert.isObject( WPorgActions );
	} );

	it( 'Actions should have method fetchPluginsList', () => {
		assert.isFunction( WPorgActions.fetchPluginsList );
	} );

	it( 'Actions should have method fetchCuratedList', () => {
		assert.isFunction( WPorgActions.fetchCuratedList );
	} );

	it( 'Actions should have method fetchNextCategoryPage', () => {
		assert.isFunction( WPorgActions.fetchNextCategoryPage );
	} );

	it( 'when fetching a plugin list, it shouldn\'t do the wporg request if there\'s a previous one still not finished for the same category', () => {
		mockedWporg.deactivatedCallbacks = true;
		WPorgActions.fetchPluginsList( 'new', 1 );
		WPorgActions.fetchPluginsList( 'new', 1 );
		assert.equal( mockedWporg.getActivity().fetchPluginsList, 1 );
	} );

	it( 'should return our Calypso curated feature list', () => {
		const curatedSpy = spy( WPorgActions, 'fetchCuratedList' );
		WPorgActions.fetchPluginsList( 'featured', 1 );
		assert.isTrue( curatedSpy.called );
	} );

	it( 'does not return the community featured list', () => {
		WPorgActions.fetchPluginsList( 'featured', 1 );
		assert.equal( mockedWporg.getActivity().fetchPluginsList, 0 );
	} );

	it( 'when fetching for the next page, the next page number should be calculated automatically', () => {
		WPorgActions.fetchPluginsList( 'new', 1 );
		WPorgActions.fetchNextCategoryPage( 'new' );
		assert.equal( mockedWporg.getActivity().lastRequestParams.page, 2 );
	} );

	it( 'when fetching for the next page, it should do a request if the next page is not over the number of total pages', () => {
		WPorgActions.fetchPluginsList( 'new', 1 );
		WPorgActions.fetchNextCategoryPage( 'new' );
		assert.equal( mockedWporg.getActivity().fetchPluginsList, 2 );
	} );

	it( 'when fetching for the next page, it should not do any request if the next page is over the number of total pages', () => {
		mockedWporg.mockedNumberOfReturnedPages = 1;
		WPorgActions.fetchPluginsList( 'new', 1 );
		WPorgActions.fetchNextCategoryPage( 'new' );
		assert.equal( mockedWporg.getActivity().fetchPluginsList, 1 );
	} );
} );
