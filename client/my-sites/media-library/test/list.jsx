/**
 * @jest-environment jsdom
 */
jest.mock( 'lib/wp', () => ( {
	me: () => ( {
		get: () => {}
	} )
} ) );
jest.mock( 'components/infinite-list', () => require( 'components/empty-component' ) );
jest.mock( 'my-sites/media-library/list-item', () => require( 'components/empty-component' ) );
jest.mock( 'my-sites/media-library/list-plan-upgrade-nudge', () => require( 'components/empty-component' ) );

/**
 * External dependencies
 */
import { expect } from 'chai';
import { mount } from 'enzyme';
import { toArray } from 'lodash';
import React from 'react';

/**
 * Internal dependencies
 */
import Dispatcher from 'dispatcher';
import fixtures from './fixtures';
import { MediaLibraryList as MediaList } from '../list';
import MediaLibrarySelectedData from 'components/data/media-library-selected-data';
import MediaLibrarySelectedStore from 'lib/media/library-selected-store';
import MediaActions from 'lib/media/actions';

/**
 * Module variables
 */
const DUMMY_SITE_ID = 2916284;

describe( 'MediaLibraryList item selection', function() {
	let wrapper, mediaList;

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

	before( function() {
		Dispatcher.handleServerAction( {
			type: 'RECEIVE_MEDIA_ITEMS',
			siteId: DUMMY_SITE_ID,
			data: fixtures
		} );
	} );

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
					<MediaList
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
					<MediaList
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

	context( 'google photos', () => {
		let largeLibrary = [];

		const getList = ( media, source ) => {
			return mount(
				<MediaList
					filterRequiresUpgrade={ false }
					site={ { ID: DUMMY_SITE_ID } }
					media={ media }
					mediaScale={ 0.24 }
					source={ source }
					single />
				).find( MediaList ).get( 0 );
		};

		before( () => {
			while ( largeLibrary.length < 1000 ) {
				largeLibrary = largeLibrary.concat( fixtures.media );
			}
		} );

		it( 'displays a trailing message when media library showing > 1000 google photos', () => {
			const list = getList( largeLibrary, 'google_photos' );

			expect( list.renderTrailingItems() ).to.not.be.null;
		} );

		it( 'doesnt displays a trailing message when media library showing > 1000 non-google photos', () => {
			const list = getList( largeLibrary, '' );

			expect( list.renderTrailingItems() ).to.be.null;
		} );

		it( 'doesnt display a trailing message when media library showing < 1000 photos', () => {
			const list = getList( largeLibrary.slice( 0, 10 ), 'google_photos' );

			expect( list.renderTrailingItems() ).to.be.null;
		} );
	} );
} );
