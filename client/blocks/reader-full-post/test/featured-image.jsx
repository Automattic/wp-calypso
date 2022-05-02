/**
 * @jest-environment jsdom
 */
import { fireEvent, render } from '@testing-library/react';
import FeaturedImage from '../featured-image';

describe( 'FeaturedImage', () => {
	test( 'sets the source to an empty string if the image fails to load', () => {
		const nonExistentImage = 'http://sketchy-feed.com/missing-image-2.jpg';
		const { container } = render( <FeaturedImage src={ nonExistentImage } /> );
		const div = container.getElementsByClassName( 'reader-full-post__featured-image' )[ 0 ];

		fireEvent.error( div.getElementsByTagName( 'img' )[ 0 ] );

		expect( getComputedStyle( div ).getPropertyValue( 'display' ) ).toBe( 'none' );
	} );
} );
