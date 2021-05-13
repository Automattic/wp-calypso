/**
 * @jest-environment jsdom
 */

/**
 * External dependencies
 */
import { expect } from 'chai';
import { shallow } from 'enzyme';
import React from 'react';

/**
 * Internal dependencies
 */
import fixtures from './fixtures';
import resize from 'calypso/lib/resize-image-url';
import ListItemImage from 'calypso/my-sites/media-library/list-item-image';

const WIDTH = 450;

describe( 'MediaLibraryListItem image', () => {
	let wrapper;

	beforeEach( () => {
		if ( wrapper ) {
			wrapper.unmount();
		}
	} );

	const getResizedUrl = () =>
		resize( fixtures.media[ 0 ].URL, { resize: `${ WIDTH },${ WIDTH }` } );
	const getItem = ( itemPos, type ) => (
		<ListItemImage
			media={ fixtures.media[ itemPos ] }
			scale={ 1 }
			maxScale={ 1 }
			maxImageWidth={ WIDTH }
			thumbnailType={ type }
		/>
	);

	describe( 'thumbnail display mode', () => {
		test( 'defaults to photon when no thumbnail parameter is passed', () => {
			wrapper = shallow( getItem( 0 ) );

			expect( wrapper.props().src ).to.be.equal( getResizedUrl() );
		} );
		test( 'returns a resized private thumbnail for type MEDIA_IMAGE_RESIZER', () => {
			wrapper = shallow( getItem( 0, 'MEDIA_IMAGE_RESIZER' ) );

			expect( wrapper.props().src ).to.be.equal( getResizedUrl() );
		} );

		test( 'returns existing medium thumbnail for type MEDIA_IMAGE_THUMBNAIL', () => {
			wrapper = shallow( getItem( 0, 'MEDIA_IMAGE_THUMBNAIL' ) );

			expect( wrapper.props().src ).to.be.equal( fixtures.media[ 0 ].thumbnails.medium );
		} );

		test( 'returns resized thumbnail for type MEDIA_IMAGE_THUMBNAIL when no medium thumbnail', () => {
			wrapper = shallow( getItem( 1, 'MEDIA_IMAGE_THUMBNAIL' ) );

			expect( wrapper.props().src ).to.be.equal( getResizedUrl() );
		} );
	} );
} );
