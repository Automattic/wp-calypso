/**
 * External dependencies
 */
import { assert } from 'chai';
import { shallow } from 'enzyme';
import React from 'react';

/**
 * Internal dependencies
 */
import FeaturedImage from '../featured-image';

describe( 'FeaturedImage', () => {
	test( 'sets the source to an empty string if the image fails to load', () => {
		const nonExistentImage = 'http://sketchy-feed.com/missing-image-2.jpg';
		const wrapper = shallow( <FeaturedImage src={ nonExistentImage } /> );
		wrapper.instance().handleImageError();
		assert.equal( '', wrapper.state( 'src' ) );
	} );
} );
