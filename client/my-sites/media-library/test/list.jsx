/**
 * External dependencies
 */
import { expect } from 'chai';
import { noop, toArray } from 'lodash';
import React from 'react';
import mockery from 'mockery';
import { localize } from 'i18n-calypso';

/**
 * Internal dependencies
 */
import EmptyComponent from 'test/helpers/react/empty-component';
import useFakeDom from 'test/helpers/use-fake-dom';
import useMockery from 'test/helpers/use-mockery';

/**
 * Module variables
 */
const DUMMY_SITE_ID = 2916284;

let mount, MediaLibrarySelectedData, MediaLibrarySelectedStore,
	MediaActions, fixtures, Dispatcher, MediaList, LocalizedMediaList;

useFakeDom();
useMockery();

before( function() {
	mockery.registerMock( 'lib/wp', {
		me: () => ( {
			get: noop
		} )
	} );
	mockery.registerMock( 'react-virtualized/AutoSizer', EmptyComponent );
	mockery.registerMock( 'react-virtualized/InfiniteLoader', EmptyComponent );
	mockery.registerMock( 'react-virtualized/Grid', EmptyComponent );
	mockery.registerMock( 'react-virtualized/WindowScroller', EmptyComponent );
	mockery.registerMock( './list-item', EmptyComponent );
	mockery.registerMock( './list-plan-upgrade-nudge', EmptyComponent );

	mount = require( 'enzyme' ).mount;
	MediaLibrarySelectedData = require( 'components/data/media-library-selected-data' );
	MediaLibrarySelectedStore = require( 'lib/media/library-selected-store' );
	MediaActions = require( 'lib/media/actions' );
	fixtures = require( './fixtures' );
	Dispatcher = require( 'dispatcher' );

	Dispatcher.handleServerAction( {
		type: 'RECEIVE_MEDIA_ITEMS',
		siteId: DUMMY_SITE_ID,
		data: fixtures
	} );

	MediaList = require( '../list' ).MediaLibraryList;
	LocalizedMediaList = localize( MediaList );
} );

describe( 'MediaLibraryList item selection', function() {
	let mediaList, wrapper;

	function toggleItem( itemIndex, shiftClick ) {
		mediaList.toggleItem( fixtures.media[ itemIndex ], shiftClick );
	}

	function expectSelectedItems() {
		expect( MediaLibrarySelectedStore.getAll( DUMMY_SITE_ID ) ).to.have.members(
			toArray( arguments ).map( function( arg ) {
				return fixtures.media[ arg ];
			} )
		);
	}

	beforeEach( function() {
		MediaActions.setLibrarySelectedItems( DUMMY_SITE_ID, [] );

		if ( wrapper ) {
			wrapper.unmount();
		}
	} );

	context( 'multiple selection', function() {
		beforeEach( () => {
			wrapper = mount(
				<MediaLibrarySelectedData siteId={ DUMMY_SITE_ID }>
					<LocalizedMediaList
						filterRequiresUpgrade={ false }
						site={ { ID: DUMMY_SITE_ID } }
						media={ fixtures.media }
						mediaScale={ 0.24 } />
				</MediaLibrarySelectedData>
			);
			mediaList = wrapper.find( MediaList ).get( 0 );
		} );

		it( 'allows selecting single items', function() {
			toggleItem( 0 );
			expectSelectedItems( 0 );
			toggleItem( 2 );
			expectSelectedItems( 0, 2 );
		} );

		it( 'allows selecting multiple items at once by Shift+clicking', function() {
			toggleItem( 0 );
			toggleItem( 4, true ); // Shift+click to select items 0 through 4
			expectSelectedItems( 0, 1, 2, 3, 4 );
		} );

		it( 'allows selecting single and multiple items', function() {
			toggleItem( 1 );
			expectSelectedItems( 1 );
			toggleItem( 5 );
			toggleItem( 9, true );
			expectSelectedItems( 1, 5, 6, 7, 8, 9 );
		} );

		it( 'allows chaining Shift+click selections from first item', function() {
			toggleItem( 0 );
			toggleItem( 3, true );
			expectSelectedItems( 0, 1, 2, 3 );
			toggleItem( 6, true );
			expectSelectedItems( 0, 1, 2, 3, 4, 5, 6 );
		} );

		it( 'allows chaining Shift+click selections to last item', function() {
			toggleItem( 3 );
			toggleItem( 6, true );
			expectSelectedItems( 3, 4, 5, 6 );
			toggleItem( 9, true );
			expectSelectedItems( 3, 4, 5, 6, 7, 8, 9 );
		} );

		it( 'allows chaining Shift+click deselections', function() {
			// first select all items
			toggleItem( 0 );
			toggleItem( 9, true );
			expectSelectedItems( 0, 1, 2, 3, 4, 5, 6, 7, 8, 9 );
			toggleItem( 1 );
			expectSelectedItems( 0, 2, 3, 4, 5, 6, 7, 8, 9 );
			toggleItem( 4, true );
			expectSelectedItems( 0, 5, 6, 7, 8, 9 );
			toggleItem( 7, true );
			expectSelectedItems( 0, 8, 9 );
		} );

		it( 'allows selecting then deselecting multiple items', function() {
			toggleItem( 1 );
			toggleItem( 6, true );
			expectSelectedItems( 1, 2, 3, 4, 5, 6 );
			toggleItem( 1, true );
			expectSelectedItems();
		} );

		it( 'selects the previously and currently clicked items when Shift+clicking', function() {
			toggleItem( 1 );
			toggleItem( 4, true );
			expectSelectedItems( 1, 2, 3, 4 );
			toggleItem( 5 );
			toggleItem( 0, true );
			expectSelectedItems( 0, 1, 2, 3, 4, 5 );
		} );
	} );

	context( 'single selection', function() {
		beforeEach( () => {
			wrapper = mount(
				<MediaLibrarySelectedData siteId={ DUMMY_SITE_ID }>
					<LocalizedMediaList
						filterRequiresUpgrade={ false }
						site={ { ID: DUMMY_SITE_ID } }
						media={ fixtures.media }
						mediaScale={ 0.24 }
						single />
				</MediaLibrarySelectedData>
			);
			mediaList = wrapper.find( MediaList ).get( 0 );
		} );

		it( 'allows selecting a single item', function() {
			toggleItem( 0 );
			expectSelectedItems( 0 );
			toggleItem( 2 );
			expectSelectedItems( 2 );
		} );

		it( 'allows deselecting a single item', function() {
			toggleItem( 0 );
			expectSelectedItems( 0 );
			toggleItem( 0 );
			expectSelectedItems();
		} );

		it( 'only selects a single item when selecting multiple via Shift+click', function() {
			toggleItem( 0 );
			toggleItem( 4, true ); // Shift+click to select items 0 through 4
			expectSelectedItems( 4 );
		} );
	} );
} );

describe( 'getGridItems()', () => {
	let wrapper;

	function getGridItemsWith( { media, nextPage, columnCount } ) {
		wrapper = mount(
			<LocalizedMediaList
				batchSize={ 1 }
				media={ media }
				mediaHasNextPage={ nextPage }
				mediaScale={ 1 / columnCount }
				site={ { ID: DUMMY_SITE_ID } } />
		);

		return wrapper.find( MediaList ).get( 0 ).getGridItems();
	}

	afterEach( () => {
		wrapper.unmount();
	} );

	it( 'should return placeholders', function() {
		expect( getGridItemsWith( {
			media: [],
			nextPage: true,
			columnCount: 2
		} ) ).to.eql( [
			{ heading: '' }, undefined,
			{ loading: true }
		] );
	} );

	it( 'should return a heading, media, and placeholders', function() {
		expect( getGridItemsWith( {
			media: fixtures.media,
			nextPage: true,
			columnCount: 2
		} ) ).to.eql( [
			{ heading: 'Today' }, undefined,
			...fixtures.media,
			{ loading: true }
		] );
	} );

	it( 'should return a heading, media, but no placeholders', function() {
		expect( getGridItemsWith( {
			media: fixtures.media,
			nextPage: false,
			columnCount: 2
		} ) ).to.eql( [
			{ heading: 'Today' }, undefined,
			...fixtures.media
		] );
	} );

	it( 'should return multiple headings', function() {
		expect( getGridItemsWith( {
			media: [ ...fixtures.media, { date: '2000-01-01' } ],
			nextPage: false,
			columnCount: 4
		} ) ).to.eql( [
			{ heading: 'Today' }, undefined, undefined, undefined,
			...fixtures.media, undefined, undefined,
			{ heading: 'January 1, 2000' }, undefined, undefined, undefined,
			{ date: '2000-01-01' }
		] );
	} );
} );
