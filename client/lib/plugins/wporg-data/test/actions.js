/**
 * External dependencies
 */

import { assert, expect } from 'chai';
import { spy } from 'sinon';

/**
 * Internal dependencies
 */
import useMockery from 'test/helpers/use-mockery';
import mockedWporg from './mocks/wporg';

describe( 'WPorg Data Actions', () => {
	let WPorgActions;

	useMockery( mockery => {
		mockery.registerMock( 'lib/wporg', mockedWporg );
		mockery.registerMock( 'lodash/debounce', cb => cb );
	} );

	beforeEach( () => {
		WPorgActions = require( 'lib/plugins/wporg-data/actions' );
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

	it( 'should call fetchCuratedList for the "featured" category', () => {
		const curatedSpy = spy( WPorgActions, 'fetchCuratedList' );
		WPorgActions.fetchPluginsList( 'featured', 1 );
		expect( curatedSpy.called ).to.be.true;
	} );

	it( 'should not call wporg.fetchPluginsList for the "featured" category', () => {
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
