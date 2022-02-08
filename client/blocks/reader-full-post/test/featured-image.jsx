/**
 * @jest-environment jsdom
 */
import { mount } from 'enzyme';
import FeaturedImage from '../featured-image';

describe( 'FeaturedImage', () => {
	test( 'sets the source to an empty string if the image fails to load', () => {
		const nonExistentImage = 'http://sketchy-feed.com/missing-image-2.jpg';
		const wrapper = mount( <FeaturedImage src={ nonExistentImage } /> );
		const div = wrapper.find( '.reader-full-post__featured-image' ).at( 0 ).getDOMNode();

		wrapper.find( 'img' ).simulate( 'error' );

		expect( getComputedStyle( div ).getPropertyValue( 'display' ) ).toBe( 'none' );
	} );
} );
