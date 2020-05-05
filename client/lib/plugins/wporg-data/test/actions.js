/**
 * External dependencies
 */
import { assert } from 'chai';
import { spy } from 'sinon';

/**
 * Internal dependencies
 */
import WPorgActions from 'lib/plugins/wporg-data/actions';
import * as mockedWporg from 'lib/wporg';
jest.mock( 'lib/wporg', () => require( './mocks/wporg' ) );
jest.mock( 'lib/impure-lodash', () => ( {
	debounce: ( cb ) => cb,
} ) );

describe( 'WPorg Data Actions', () => {
	beforeEach( () => {
		WPorgActions.reset();
		mockedWporg.reset();
	} );

	test( 'Actions should be an object', () => {
		assert.isObject( WPorgActions );
	} );

	test( 'Actions should have method fetchPluginsList', () => {
		assert.isFunction( WPorgActions.fetchPluginsList );
	} );

	test( 'Actions should have method fetchCuratedList', () => {
		assert.isFunction( WPorgActions.fetchCuratedList );
	} );

	test( 'Actions should have method fetchNextCategoryPage', () => {
		assert.isFunction( WPorgActions.fetchNextCategoryPage );
	} );

	test( "when fetching a plugin list, it shouldn't do the wporg request if there's a previous one still not finished for the same category", () => {
		mockedWporg.setInternalState( { deactivatedCallbacks: true } );
		WPorgActions.fetchPluginsList( 'new', 1 );
		WPorgActions.fetchPluginsList( 'new', 1 );
		assert.equal( mockedWporg.getActivity().fetchPluginsList, 1 );
	} );

	test( 'should return our Calypso curated feature list', () => {
		const curatedSpy = spy( WPorgActions, 'fetchCuratedList' );
		WPorgActions.fetchPluginsList( 'featured', 1 );
		assert.isTrue( curatedSpy.called );
	} );

	test( 'does not return the community featured list', () => {
		WPorgActions.fetchPluginsList( 'featured', 1 );
		assert.equal( mockedWporg.getActivity().fetchPluginsList, 0 );
	} );

	test( 'when fetching for the next page, the next page number should be calculated automatically', () => {
		WPorgActions.fetchPluginsList( 'new', 1 );
		WPorgActions.fetchNextCategoryPage( 'new' );
		assert.equal( mockedWporg.getActivity().lastRequestParams.page, 2 );
	} );

	test( 'when fetching for the next page, it should do a request if the next page is not over the number of total pages', () => {
		WPorgActions.fetchPluginsList( 'new', 1 );
		WPorgActions.fetchNextCategoryPage( 'new' );
		assert.equal( mockedWporg.getActivity().fetchPluginsList, 2 );
	} );

	test( 'when fetching for the next page, it should not do any request if the next page is over the number of total pages', () => {
		mockedWporg.setInternalState( { mockedNumberOfReturnedPages: 1 } );
		WPorgActions.fetchPluginsList( 'new', 1 );
		WPorgActions.fetchNextCategoryPage( 'new' );
		assert.equal( mockedWporg.getActivity().fetchPluginsList, 1 );
	} );
} );
