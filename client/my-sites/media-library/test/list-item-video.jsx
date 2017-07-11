/**
 * @jest-environment jsdom
 */

/**
 * External dependencies
 */
import { expect } from 'chai';
import React from 'react';

/**
 * Internal dependencies
 */
import useMockery from 'test/helpers/use-mockery';
import photon from 'photon';
import ListItemVideo from 'my-sites/media-library/list-item-video';

const WIDTH = 450;

const styleUrl = url => `url(${ url })`;

describe( 'MediaLibraryListItem video', function() {
	let shallow, wrapper, fixtures;

	useMockery();

	before( function() {
		shallow = require( 'enzyme' ).shallow;
		fixtures = require( './fixtures' );
	} );

	beforeEach( function() {
		if ( wrapper ) {
			wrapper.unmount();
		}
	} );

	const expectedBackground = () => styleUrl( photon( fixtures.media[ 1 ].thumbnails.fmt_hd, { width: WIDTH } ) );
	const getItem = type => <ListItemVideo media={ fixtures.media[ 1 ] } scale={ 1 } maxImageWidth={ WIDTH } thumbnailType={ type } />;

	context( 'thumbnail display mode', function() {
		it( 'defaults to photon', function() {
			wrapper = shallow( getItem() );

			expect( wrapper.props().style.backgroundImage ).to.be.equal( expectedBackground() );
		} );

		it( 'returns a photon thumbnail for type MEDIA_IMAGE_PHOTON', function() {
			wrapper = shallow( getItem( 'MEDIA_IMAGE_PHOTON' ) );

			expect( wrapper.props().style.backgroundImage ).to.be.equal( expectedBackground() );
		} );

		it( 'returns a photon thumbnail for type MEDIA_IMAGE_RESIZER', function() {
			wrapper = shallow( getItem( 'MEDIA_IMAGE_RESIZER' ) );

			expect( wrapper.props().style.backgroundImage ).to.be.equal( expectedBackground() );
		} );

		it( 'returns existing fmt_hd thumbnail for type MEDIA_IMAGE_THUMBNAIL', function() {
			wrapper = shallow( getItem( 'MEDIA_IMAGE_THUMBNAIL' ) );

			expect( wrapper.props().style.backgroundImage ).to.be.equal( styleUrl( fixtures.media[ 1 ].thumbnails.fmt_hd ) );
		} );
	} );
} );
