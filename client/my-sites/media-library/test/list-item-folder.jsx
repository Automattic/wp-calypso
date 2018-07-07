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
import { folders as FOLDER_FIXTURES } from './fixtures';
import ListItemFolder from '../list-item-folder';
import Count from 'components/count';

const WIDTH = 450;

describe( 'MediaLibraryListItemFolder', () => {
	let wrapper;

	beforeEach( () => {
		if ( wrapper ) {
			wrapper.unmount();
		}
	} );

	const getItem = type => (
		<ListItemFolder
			media={ FOLDER_FIXTURES[ 0 ] }
			scale={ 1 }
			maxImageWidth={ WIDTH }
			thumbnailType={ type }
		/>
	);

	test( 'it displays the Folder name', () => {
		const expected = FOLDER_FIXTURES[ 0 ].name;

		wrapper = shallow( getItem() );

		expect( wrapper.find( '.media-library__list-item-folder-name-text' ).text() ).toBe( expected );
	} );

	test( 'it passes the children property of the Folder object to the Count component', () => {
		const expected = FOLDER_FIXTURES[ 0 ].children;

		wrapper = shallow( getItem() );

		expect( wrapper.find( Count ).prop( 'count' ) ).toBe( expected );
	} );
} );
