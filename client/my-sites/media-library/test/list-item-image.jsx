/**
 * External dependencies
 */
import { expect } from 'chai';
import photon from 'photon';
import React from 'react';

/**
 * Internal dependencies
 */
import resize from 'lib/resize-image-url';
import ListItemImage from 'my-sites/media-library/list-item-image';
import useFakeDom from 'test/helpers/use-fake-dom';
import useMockery from 'test/helpers/use-mockery';

const WIDTH = 450;

describe( 'MediaLibraryListItem image', function() {
	let shallow, wrapper, fixtures;

	useFakeDom();
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

	const getPhotonUrl = () => photon( fixtures.media[ 0 ].URL, { width: WIDTH } );
	const getResizedUrl = () => resize( fixtures.media[ 0 ].URL, { w: WIDTH } );
	const getItem = ( itemPos, type ) =>
		<ListItemImage
			media={ fixtures.media[ itemPos ] }
			scale={ 1 }
			maxImageWidth={ WIDTH }
			thumbnailType={ type } />;

	context( 'thumbnail display mode', function() {
		it( 'defaults to photon when no thumbnail parameter is passed', function() {
			wrapper = shallow( getItem( 0 ) );

			expect( wrapper.props().src ).to.be.equal( getPhotonUrl() );
		} );

		it( 'returns a photon thumbnail for type MEDIA_IMAGE_PHOTON', function() {
			wrapper = shallow( getItem( 0, 'MEDIA_IMAGE_PHOTON' ) );

			expect( wrapper.props().src ).to.be.equal( getPhotonUrl() );
		} );

		it( 'returns a resized private thumbnail for type MEDIA_IMAGE_RESIZER', function() {
			wrapper = shallow( getItem( 0, 'MEDIA_IMAGE_RESIZER' ) );

			expect( wrapper.props().src ).to.be.equal( getResizedUrl() );
		} );

		it( 'returns existing medium thumbnail for type MEDIA_IMAGE_THUMBNAIL', function() {
			wrapper = shallow( getItem( 0, 'MEDIA_IMAGE_THUMBNAIL' ) );

			expect( wrapper.props().src ).to.be.equal( fixtures.media[ 0 ].thumbnails.medium );
		} );

		it( 'returns resized thumbnail for type MEDIA_IMAGE_THUMBNAIL when no medium thumbnail', function() {
			wrapper = shallow( getItem( 1, 'MEDIA_IMAGE_THUMBNAIL' ) );

			expect( wrapper.props().src ).to.be.equal( getResizedUrl() );
		} );
	} );
} );
