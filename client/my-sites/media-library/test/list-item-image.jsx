/**
 * External dependencies
 */
import { expect } from 'chai';
import React from 'react';

/**
 * Internal dependencies
 */
import useFakeDom from 'test/helpers/use-fake-dom';
import useMockery from 'test/helpers/use-mockery';
import photon from 'photon';
import resize from 'lib/resize-image-url';
import ListItemImage from 'my-sites/media-library/list-item-image';

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
	const getItem = usePhoton => <ListItemImage media={ fixtures.media[ 0 ] } scale={ 1 } photon={ usePhoton } maxImageWidth={ WIDTH } />;

	context( 'thumbnail display mode', function() {
		it( 'defaults to photon when no photon parameter is passed', function() {
			wrapper = shallow( getItem() );

			expect( wrapper.props().src ).to.be.equal( getPhotonUrl() );
		} );

		it( 'returns a photon thumbnail for a public image', function() {
			wrapper = shallow( getItem( true ) );

			expect( wrapper.props().src ).to.be.equal( getPhotonUrl() );
		} );

		it( 'returns a resized thumbnail for a private image', function() {
			wrapper = shallow( getItem( false ) );

			expect( wrapper.props().src ).to.be.equal( getResizedUrl() );
		} );
	} );
} );
