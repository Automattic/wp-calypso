/**
 * @jest-environment jsdom
 */

/**
 * External dependencies
 */
import { expect } from 'chai';
import { mount } from 'enzyme';
import { toArray } from 'lodash';
import React from 'react';
import moment from 'moment';

/**
 * Internal dependencies
 */
import { MediaLibraryList as MediaList } from '../list';
import fixtures from './fixtures';
import MediaLibrarySelectedData from 'components/data/media-library-selected-data';
import Dispatcher from 'dispatcher';
import MediaActions from 'lib/media/actions';
import MediaLibrarySelectedStore from 'lib/media/library-selected-store';

jest.mock( 'lib/user', () => () => {} );
jest.mock( 'components/infinite-list', () => require( 'components/empty-component' ) );
jest.mock( 'my-sites/media-library/list-item', () => require( 'components/empty-component' ) );
jest.mock( 'my-sites/media-library/list-plan-upgrade-nudge', () =>
	require( 'components/empty-component' )
);

/**
 * Module variables
 */
const DUMMY_SITE_ID = 2916284;

describe( 'MediaLibraryList item selection', () => {
	let wrapper, mediaList;

	function toggleItem( itemIndex, shiftClick ) {
		mediaList.toggleItem( fixtures.media[ itemIndex ], shiftClick );
	}

	function expectSelectedItems() {
		expect( MediaLibrarySelectedStore.getAll( DUMMY_SITE_ID ) ).to.have.members(
			toArray( arguments ).map( function ( arg ) {
				return fixtures.media[ arg ];
			} )
		);
	}

	beforeAll( function () {
		Dispatcher.handleServerAction( {
			type: 'RECEIVE_MEDIA_ITEMS',
			siteId: DUMMY_SITE_ID,
			data: fixtures,
		} );
	} );

	beforeEach( () => {
		MediaActions.setLibrarySelectedItems( DUMMY_SITE_ID, [] );
	} );

	describe( 'multiple selection', () => {
		beforeEach( () => {
			wrapper = mount(
				<MediaLibrarySelectedData siteId={ DUMMY_SITE_ID }>
					<MediaList
						filterRequiresUpgrade={ false }
						site={ { ID: DUMMY_SITE_ID } }
						media={ fixtures.media }
						mediaScale={ 0.24 }
						moment={ moment }
					/>
				</MediaLibrarySelectedData>
			);
			mediaList = wrapper.find( MediaList ).instance();
		} );

		afterEach( () => {
			wrapper.unmount();
		} );

		test( 'allows selecting single items', () => {
			toggleItem( 0 );
			expectSelectedItems( 0 );
			toggleItem( 2 );
			expectSelectedItems( 0, 2 );
		} );

		test( 'allows selecting multiple items at once by Shift+clicking', () => {
			toggleItem( 0 );
			toggleItem( 4, true ); // Shift+click to select items 0 through 4
			expectSelectedItems( 0, 1, 2, 3, 4 );
		} );

		test( 'allows selecting single and multiple items', () => {
			toggleItem( 1 );
			expectSelectedItems( 1 );
			toggleItem( 5 );
			toggleItem( 9, true );
			expectSelectedItems( 1, 5, 6, 7, 8, 9 );
		} );

		test( 'allows chaining Shift+click selections from first item', () => {
			toggleItem( 0 );
			toggleItem( 3, true );
			expectSelectedItems( 0, 1, 2, 3 );
			toggleItem( 6, true );
			expectSelectedItems( 0, 1, 2, 3, 4, 5, 6 );
		} );

		test( 'allows chaining Shift+click selections to last item', () => {
			toggleItem( 3 );
			toggleItem( 6, true );
			expectSelectedItems( 3, 4, 5, 6 );
			toggleItem( 9, true );
			expectSelectedItems( 3, 4, 5, 6, 7, 8, 9 );
		} );

		test( 'allows chaining Shift+click deselections', () => {
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

		test( 'allows selecting then deselecting multiple items', () => {
			toggleItem( 1 );
			toggleItem( 6, true );
			expectSelectedItems( 1, 2, 3, 4, 5, 6 );
			toggleItem( 1, true );
			expectSelectedItems();
		} );

		test( 'selects the previously and currently clicked items when Shift+clicking', () => {
			toggleItem( 1 );
			toggleItem( 4, true );
			expectSelectedItems( 1, 2, 3, 4 );
			toggleItem( 5 );
			toggleItem( 0, true );
			expectSelectedItems( 0, 1, 2, 3, 4, 5 );
		} );
	} );

	describe( 'single selection', () => {
		beforeEach( () => {
			wrapper = mount(
				<MediaLibrarySelectedData siteId={ DUMMY_SITE_ID }>
					<MediaList
						filterRequiresUpgrade={ false }
						site={ { ID: DUMMY_SITE_ID } }
						media={ fixtures.media }
						mediaScale={ 0.24 }
						moment={ moment }
						single
					/>
				</MediaLibrarySelectedData>
			);
			mediaList = wrapper.find( MediaList ).instance();
		} );

		afterEach( () => {
			wrapper.unmount();
		} );

		test( 'allows selecting a single item', () => {
			toggleItem( 0 );
			expectSelectedItems( 0 );
			toggleItem( 2 );
			expectSelectedItems( 2 );
		} );

		test( 'allows deselecting a single item', () => {
			toggleItem( 0 );
			expectSelectedItems( 0 );
			toggleItem( 0 );
			expectSelectedItems();
		} );

		test( 'only selects a single item when selecting multiple via Shift+click', () => {
			toggleItem( 0 );
			toggleItem( 4, true ); // Shift+click to select items 0 through 4
			expectSelectedItems( 4 );
		} );
	} );

	describe( 'ungrouped sources', () => {
		const getList = ( media, source ) => {
			return mount(
				<MediaList
					filterRequiresUpgrade={ false }
					site={ { ID: DUMMY_SITE_ID } }
					media={ media }
					mediaScale={ 0.24 }
					moment={ moment }
					source={ source }
					single
				/>
			)
				.find( MediaList )
				.instance();
		};

		test( 'should have no group label for an ungrouped source', () => {
			const grid = getList( fixtures.media, 'pexels' ).render();
			expect( grid.props.getGroupLabel() ).to.equal( '' );
		} );

		test( 'should use the source name as the item group for an ungrouped source', () => {
			const grid = getList( fixtures.media, 'pexels' ).render();
			expect( grid.props.getItemGroup() ).to.equal( 'pexels' );
		} );
	} );
} );
