/**
 * External dependencies
 */
import { assert } from 'chai';
import { mount } from 'enzyme';

/**
 * Internal dependencies
 */
import useFakeDom from 'test/helpers/use-fake-dom';


describe( 'FeaturedImage', () => {
	let React, FeaturedImage, imageStub;

	useFakeDom();

	before( () => {
		React = require('react');
		FeaturedImage = require( '../featured-image' );
		imageStub = {};
		global.Image = () => imageStub;
	} );

	after( () => {
		global.Image = null;
	} );

	it( 'renders null if the image does not exist', () => {
		 const nonExistantImage = 'http://sketchy-feed.com/missing-image-2.jpg';
		 const wrapper = mount( <FeaturedImage src={ nonExistantImage } /> );
		 assert.isNull( wrapper.html() );
	} );
} );
