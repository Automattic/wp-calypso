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
import ListItemVideo from 'my-sites/media-library/list-item-video';

const WIDTH = 450;

const styleUrl = url => `url(${ url })`;

describe( 'MediaLibraryListItem video', function() {
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

	const expectedBackground = () => styleUrl( photon( fixtures.media[ 1 ].thumbnails.fmt_hd, { width: WIDTH } ) );
	const getItem = () => <ListItemVideo media={ fixtures.media[ 1 ] } scale={ 1 } maxImageWidth={ WIDTH } />;

	context( 'thumbnail display mode', function() {
		it( 'returns a photon thumbnail for a video', function() {
			wrapper = shallow( getItem() );

			expect( wrapper.props().style.backgroundImage ).to.be.equal( expectedBackground() );
		} );
	} );
} );
