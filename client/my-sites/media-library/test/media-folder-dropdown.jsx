/**
 * @format
 * @jest-environment jsdom
 */

/**
 * External dependencies
 */
import React from 'react';
import { shallow } from 'enzyme';

/**
 * Internal dependencies
 */
import { folders } from './fixtures';
import { MediaFolderDropdown } from '../media-folder-dropdown';
import SelectDropdown from 'components/select-dropdown';

const noop = rtn => rtn;

describe( 'MediaFolderDropdown', () => {
	let wrapper;

	beforeEach( () => {
		if ( wrapper ) {
			wrapper.unmount();
		}
	} );

	test( 'default rendering', () => {
		wrapper = shallow( <MediaFolderDropdown translate={ noop } folders={ folders } /> );
		expect( wrapper.find( '.media-library__folder-dropdown' ) ).toMatchSnapshot();
	} );

	test( 'does not render if no folders are provided', () => {
		wrapper = shallow( <MediaFolderDropdown translate={ noop } /> );
		expect( wrapper.find( '.media-library__folder-dropdown' ) ).toHaveLength( 0 );
	} );

	describe( 'initial folder selection', () => {
		test( 'initial folder is correctly defaulted to all folders', () => {
			wrapper = shallow( <MediaFolderDropdown translate={ noop } folders={ folders } /> );
			expect( wrapper.find( SelectDropdown ).props().initialSelected ).toBe( '__all__' );
		} );

		test( 'initial folder can be overidden via props', () => {
			const expected = folders[ 0 ].value;

			wrapper = shallow(
				<MediaFolderDropdown translate={ noop } folders={ folders } initialSelected={ expected } />
			);

			expect( wrapper.find( SelectDropdown ).props().initialSelected ).toBe( expected );
		} );
	} );

	test( 'folder options correctly merge with default items', () => {
		const expected = [
			{
				value: '__all__',
				label: 'All Photos',
			},
			null,
		].concat( folders );

		wrapper = shallow( <MediaFolderDropdown translate={ noop } folders={ folders } /> );

		expect( wrapper.find( SelectDropdown ).props().options ).toEqual( expected );
	} );

	test( 'selected folder option value is correctly passed as argument to onFolderChange prop', () => {
		const spy = jest.fn();
		const selectedOption = folders[ 0 ];
		const expected = selectedOption.value;

		wrapper = shallow(
			<MediaFolderDropdown translate={ noop } folders={ folders } onFolderChange={ spy } />
		);
		const cb = wrapper.find( SelectDropdown ).props().onSelect;

		// Call the spy
		cb( selectedOption );

		expect( spy ).toBeCalledWith( expected );
	} );

	test( 'correctly forwards disabled prop to SelectDropdown', () => {
		wrapper = shallow(
			<MediaFolderDropdown translate={ noop } folders={ folders } disabled={ true } />
		);

		expect( wrapper.find( SelectDropdown ).props().disabled ).toBe( true );

		wrapper.setProps( { disabled: false } );

		expect( wrapper.find( SelectDropdown ).props().disabled ).toBe( false );
	} );
} );
