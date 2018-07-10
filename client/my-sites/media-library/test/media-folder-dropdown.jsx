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
import FormSelect from 'components/forms/form-select';

const noop = rtn => rtn;

describe( 'MediaFolderDropdown', () => {
	let wrapper;
	let FIXTURE_FOLDERS_DATA;

	beforeEach( () => {
		if ( wrapper ) {
			wrapper.unmount();
		}

		FIXTURE_FOLDERS_DATA = folders;
	} );

	test( 'default rendering', () => {
		wrapper = shallow(
			<MediaFolderDropdown translate={ noop } folders={ FIXTURE_FOLDERS_DATA } />
		);
		expect( wrapper.find( '.media-library__folder-dropdown' ).exists() ).toBe( true );
		expect( wrapper.find( FormSelect ).exists() ).toBe( true );
	} );

	test( 'does not render if no folders are provided', () => {
		wrapper = shallow( <MediaFolderDropdown translate={ noop } /> );
		expect( wrapper.find( '.media-library__folder-dropdown' ) ).toHaveLength( 0 );
	} );

	describe( 'initial folder selection', () => {
		test( 'initial folder can be set via folder prop', () => {
			const expected = FIXTURE_FOLDERS_DATA[ 1 ].ID;

			wrapper = shallow(
				<MediaFolderDropdown
					translate={ noop }
					folders={ FIXTURE_FOLDERS_DATA }
					folder={ expected }
				/>
			);

			expect( wrapper.find( FormSelect ).props().value ).toBe( expected );
		} );
	} );

	test( 'folder options correctly merge with default option', () => {
		const defaultOption = {
			ID: '/',
			name: 'All Albums',
		};

		const expected = [ defaultOption ].concat( FIXTURE_FOLDERS_DATA );

		wrapper = shallow(
			<MediaFolderDropdown
				translate={ noop }
				folders={ FIXTURE_FOLDERS_DATA }
				defaultOption={ defaultOption }
			/>
		);

		expect( wrapper.instance().getDropDownOptions( FIXTURE_FOLDERS_DATA ) ).toEqual( expected );
	} );

	test( "the onFolderChange prop is called with folder ID when FormSelect's onChange prop is triggered", () => {
		const spy = jest.fn();
		const selectedOption = FIXTURE_FOLDERS_DATA[ 0 ];
		const expected = selectedOption.value;

		wrapper = shallow(
			<MediaFolderDropdown
				translate={ noop }
				folders={ FIXTURE_FOLDERS_DATA }
				onFolderChange={ spy }
			/>
		);
		const cb = wrapper.find( FormSelect ).props().onChange;

		// Call the spy
		cb( {
			target: {
				value: expected,
			},
		} );

		expect( spy ).toHaveBeenCalledWith( expected );
	} );

	test( 'correctly forwards disabled prop to FormSelect', () => {
		wrapper = shallow(
			<MediaFolderDropdown translate={ noop } folders={ FIXTURE_FOLDERS_DATA } disabled={ true } />
		);

		expect( wrapper.find( FormSelect ).props().disabled ).toBe( true );

		wrapper.setProps( { disabled: false } );

		expect( wrapper.find( FormSelect ).props().disabled ).toBe( false );
	} );
} );
