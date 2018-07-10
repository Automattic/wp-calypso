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

const DOUBLE_CLICK_DELAY = 200;

describe( 'MediaLibraryListItem', () => {
	let wrapper;

	beforeEach( () => {
		if ( wrapper ) {
			wrapper.unmount();
		}
	} );

	describe( 'interaction events', () => {
		test( 'it calls onToggle prop only on single click', () => {
			jest.useFakeTimers();
			const mediaItem = fixtures.media[ 0 ];
			const mockOnToggle = jest.fn();
			const mockOnEnter = jest.fn();
			const shiftKey = false;

			wrapper = shallow(
				<ListItem
					media={ mediaItem }
					scale={ 1 }
					onToggle={ mockOnToggle }
					onEnter={ mockOnEnter }
				/>
			);

			wrapper.simulate( 'click', {
				shiftKey,
			} );

			jest.advanceTimersByTime( DOUBLE_CLICK_DELAY );

			expect( mockOnToggle ).toHaveBeenCalledWith( mediaItem, shiftKey );

			expect( mockOnEnter ).not.toHaveBeenCalled();
		} );

		test( 'it calls onEnter prop only on double click', () => {
			const mediaItem = fixtures.media[ 0 ];
			const mockOnToggle = jest.fn();
			const mockOnEnter = jest.fn();

			wrapper = shallow(
				<ListItem
					media={ mediaItem }
					scale={ 1 }
					onToggle={ mockOnToggle }
					onEnter={ mockOnEnter }
				/>
			);

			wrapper.simulate( 'dblclick' );

			expect( mockOnEnter ).toHaveBeenCalledWith( mediaItem );

			expect( mockOnToggle ).not.toHaveBeenCalled();
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
			);

			expect( wrapper.props()[ 'data-selected-number' ] ).toEqual( '99+' );
		} );
		test( 'when selectedIndex is under 100 it is as shown', () => {
			wrapper = shallow(
				<ListItem media={ fixtures.media[ 0 ] } scale={ 1 } selectedIndex={ 98 } />
			);

			expect( wrapper.props()[ 'data-selected-number' ] ).toEqual( 99 );
		} );
	} );
} );
