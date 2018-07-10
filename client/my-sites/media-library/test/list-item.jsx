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

const ENTER_KEY = 13;
const SPACE_KEY = 32;

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

			wrapper = shallow( <ListItem media={ mediaItem } scale={ 1 } onToggle={ mockOnToggle } /> );

			wrapper.simulate( 'click', {
				shiftKey,
			} );

			expect( mockOnToggle ).toHaveBeenCalledWith( mediaItem, shiftKey );
		} );

		test( 'it does not call onToggle prop when ENTER/SPACE key is pressed if component is not focused', () => {
			const mediaItem = fixtures.media[ 0 ];
			const mockOnToggle = jest.fn();

			wrapper = shallow( <ListItem media={ mediaItem } scale={ 1 } onToggle={ mockOnToggle } /> );

			// Element is not focused
			wrapper.simulate( 'keyDown', {
				keyCode: ENTER_KEY,
				preventDefault: jest.fn(),
			} );

			expect( mockOnToggle ).not.toHaveBeenCalled();
		} );

		test( 'it calls onToggle prop when ENTER/SPACE key is pressed and the component is focused', () => {
			const mediaItem = fixtures.media[ 0 ];
			const mockOnToggle = jest.fn();

			wrapper = shallow( <ListItem media={ mediaItem } scale={ 1 } onToggle={ mockOnToggle } /> );

			// FOCUSES the element
			// Enzyme cannot simulate focus so overiding
			// this method return value provides us the
			// control we need to test
			wrapper.instance().isFocused = () => true;

			wrapper.simulate( 'keyDown', {
				keyCode: ENTER_KEY,
				preventDefault: jest.fn(),
				shiftKey: false,
			} );

			expect( mockOnToggle ).toHaveBeenCalledWith( mediaItem, false );
		} );

		test( 'it prevents default browser behaviour when ENTER/SPACE key is pressed and component is focused', () => {
			const mediaItem = fixtures.media[ 0 ];

			const preventDefaultMock = jest.fn();
			wrapper = shallow( <ListItem media={ mediaItem } scale={ 1 } /> );

			// FOCUSES the element
			// Enzyme cannot simulate focus so overiding
			// this method return value provides us the
			// control we need to test
			wrapper.instance().isFocused = () => true;

			wrapper.simulate( 'keyDown', {
				keyCode: ENTER_KEY,
				preventDefault: preventDefaultMock,
			} );

			expect( preventDefaultMock ).toHaveBeenCalled();

			wrapper.simulate( 'keyDown', {
				keyCode: SPACE_KEY,
				preventDefault: preventDefaultMock,
			} );

			expect( preventDefaultMock ).toHaveBeenCalled();
		} );
	} );

	describe( 'accessibility', () => {
		test( 'has valid tabIndex attribute to allow programattic focus', () => {
			wrapper = shallow( <ListItem media={ fixtures.media[ 0 ] } scale={ 1 } /> );

			expect( wrapper.find( '[tabIndex="0"]' ) ).toHaveLength( 1 );
		} );

		test( 'has valid button role attribute', () => {
			wrapper = shallow( <ListItem media={ fixtures.media[ 0 ] } scale={ 1 } /> );

			expect( wrapper.find( '[role="button"]' ) ).toHaveLength( 1 );
		} );

		test( 'aria-pressed attribute is reflects selected state', () => {
			wrapper = shallow( <ListItem media={ fixtures.media[ 0 ] } scale={ 1 } /> );

			expect( wrapper.find( '[aria-pressed=false]' ) ).toHaveLength( 1 );

			wrapper.setProps( {
				selectedIndex: 99,
			} );

			expect( wrapper.find( '[aria-pressed=true]' ) ).toHaveLength( 1 );
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
