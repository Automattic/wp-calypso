/** @format */
/**
 * External dependencies
 */
import { shallow } from 'enzyme';
import React from 'react';

/**
 * Internal dependencies
 */
import FeaturedImage from '../featured-image';

describe( 'FeaturedImage', () => {
	test( 'sets the source to an empty string if the image fails to load', () => {
		const nonExistantImage = 'http://sketchy-feed.com/missing-image-2.jpg';
		const wrapper = shallow( <FeaturedImage src={ nonExistantImage } /> );
		wrapper.instance().handleImageError();
		expect( '' ).toEqual( wrapper.state( 'src' ) );
	} );
} );
