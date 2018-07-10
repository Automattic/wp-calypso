/**
 * @format
 * @jest-environment jsdom
 */

/**
 * External dependencies
 */
import { shallow } from 'enzyme';
import React from 'react';

/**
 * Internal dependencies
 */
import fixtures from './fixtures';
import ListItem from '../list-item';

describe( 'MediaLibraryListItem', () => {
	let wrapper;

	beforeEach( () => {
		if ( wrapper ) {
			wrapper.unmount();
		}
	} );

	describe( 'interaction events', () => {
		test( 'it calls onToggle prop on single click', () => {
			const mediaItem = fixtures.media[ 0 ];
			const mockOnToggle = jest.fn();
			const shiftKey = false;

			wrapper = shallow(
				<ListItem media={ mediaItem } scale={ 1 } onToggle={ mockOnToggle } />
			).find( '.media-library__list-item' );

			wrapper.simulate( 'click', {
				shiftKey,
			} );

			expect( mockOnToggle ).toHaveBeenCalledWith( mediaItem, shiftKey );
		} );
	} );

	describe( 'component variant branching', () => {
		test( 'it renders a ListItemFolder component when the Media item\'s type property is "folder"', () => {
			wrapper = shallow( <ListItem media={ fixtures.folders[ 0 ] } scale={ 1 } /> );

			const expected = 'MediaLibraryListItemFolder';

			const actual = wrapper.instance().renderItem().type.displayName;

			expect( actual ).toBe( expected );
		} );
	} );

	describe( 'selectedIndex', () => {
		test( 'when selectedIndex is over 99 it gets capped', () => {
			wrapper = shallow(
				<ListItem media={ fixtures.media[ 0 ] } scale={ 1 } selectedIndex={ 99 } />
			).find( '.media-library__list-item' );

			expect( wrapper.props()[ 'data-selected-number' ] ).toEqual( '99+' );
		} );
		test( 'when selectedIndex is under 100 it is as shown', () => {
			wrapper = shallow(
				<ListItem media={ fixtures.media[ 0 ] } scale={ 1 } selectedIndex={ 98 } />
			).find( '.media-library__list-item' );

			expect( wrapper.props()[ 'data-selected-number' ] ).toEqual( 99 );
		} );
	} );
} );
