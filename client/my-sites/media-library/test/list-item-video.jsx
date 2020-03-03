/**
 * @jest-environment jsdom
 */

/**
 * External dependencies
 */
import { expect } from 'chai';
import { shallow } from 'enzyme';
import photon from 'photon';
import React from 'react';

/**
 * Internal dependencies
 */
import fixtures from './fixtures';
import ListItemVideo from 'my-sites/media-library/list-item-video';

const WIDTH = 450;

const styleUrl = url => `url(${ url })`;

describe( 'MediaLibraryListItem video', () => {
	let wrapper;

	beforeEach( () => {
		if ( wrapper ) {
			wrapper.unmount();
		}
	} );

	const expectedBackground = () =>
		styleUrl( photon( fixtures.media[ 1 ].thumbnails.fmt_hd, { width: WIDTH } ) );
	const getItem = type => (
		<ListItemVideo
			media={ fixtures.media[ 1 ] }
			scale={ 1 }
			maxImageWidth={ WIDTH }
			thumbnailType={ type }
		/>
	);

	describe( 'thumbnail display mode', () => {
		test( 'defaults to photon', () => {
			wrapper = shallow( getItem() );

			expect( wrapper.props().style.backgroundImage ).to.be.equal( expectedBackground() );
		} );
		test( 'returns a photon thumbnail for type MEDIA_IMAGE_RESIZER', () => {
			wrapper = shallow( getItem( 'MEDIA_IMAGE_RESIZER' ) );

			expect( wrapper.props().style.backgroundImage ).to.be.equal( expectedBackground() );
		} );

		test( 'returns existing fmt_hd thumbnail for type MEDIA_IMAGE_THUMBNAIL', () => {
			wrapper = shallow( getItem( 'MEDIA_IMAGE_THUMBNAIL' ) );

			expect( wrapper.props().style.backgroundImage ).to.be.equal(
				styleUrl( fixtures.media[ 1 ].thumbnails.fmt_hd )
			);
		} );
	} );
} );
