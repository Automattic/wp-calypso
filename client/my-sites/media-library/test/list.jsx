/**
 * @jest-environment jsdom
 */

/* eslint jest/expect-expect: ["error", { "assertFunctionNames": ["expectSelectedItems", "expect"] }] */

/**
 * External dependencies
 */
import { expect } from 'chai';
import { mount } from 'enzyme';
import { defer, toArray } from 'lodash';
import React from 'react';
import moment from 'moment';

/**
 * Internal dependencies
 */
import { MediaLibraryList as MediaList } from '../list';
import fixtures from './fixtures';

/**
 * Module variables
 */
const DUMMY_SITE_ID = 2916284;
const mockSelectedItems = [];

jest.mock( 'calypso/lib/user', () => () => {} );
jest.mock( 'calypso/components/infinite-list', () =>
	require( 'calypso/components/empty-component' )
);
jest.mock( 'calypso/my-sites/media-library/list-item', () =>
	require( 'calypso/components/empty-component' )
);
jest.mock( 'calypso/my-sites/media-library/list-plan-upgrade-nudge', () =>
	require( 'calypso/components/empty-component' )
);

describe( 'MediaLibraryList item selection', () => {
	let wrapper;
	let mediaList;

	const setMediaLibrarySelectedItems = jest.fn();

	function toggleItem( itemIndex, shiftClick ) {
		mediaList.toggleItem( fixtures.media[ itemIndex ], shiftClick );
	}

	function expectSelectedItems() {
		defer( function () {
			expect( mockSelectedItems ).to.have.members(
				toArray( arguments ).map( function ( arg ) {
					return fixtures.media[ arg ];
				} )
			);
		} );
	}

	beforeEach( () => {
		mockSelectedItems.length = 0;
	} );

	describe( 'multiple selection', () => {
		beforeEach( () => {
			wrapper = mount(
				<MediaList
					filterRequiresUpgrade={ false }
					site={ { ID: DUMMY_SITE_ID } }
					media={ fixtures.media }
					mediaScale={ 0.24 }
					moment={ moment }
					selectedItems={ [] }
					setMediaLibrarySelectedItems={ setMediaLibrarySelectedItems }
				/>
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
				<MediaList
					filterRequiresUpgrade={ false }
					site={ { ID: DUMMY_SITE_ID } }
					media={ fixtures.media }
					mediaScale={ 0.24 }
					moment={ moment }
					single
					selectedItems={ [] }
					setMediaLibrarySelectedItems={ setMediaLibrarySelectedItems }
				/>
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
					selectedItems={ [] }
					setMediaLibrarySelectedItems={ setMediaLibrarySelectedItems }
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
