/**
 * @jest-environment jsdom
 */
import { fireEvent, render } from '@testing-library/react';
import resizeImageUrl from 'calypso/lib/resize-image-url';
import ReaderFullPostFeaturedImage from '../featured-image';

jest.mock( 'calypso/lib/resize-image-url', () => jest.fn( ( url ) => url ) );

describe( 'ReaderFullPostFeaturedImage', () => {
	beforeEach( () => {
		resizeImageUrl.mockImplementation( ( url ) => url );
	} );

	test( 'returns null when the post has no featured_image', () => {
		const { container } = render(
			<ReaderFullPostFeaturedImage post={ { title: 'Hello' } } maxWidth={ 600 } />
		);

		expect( container ).toBeEmptyDOMElement();
	} );

	test( 'renders an image with the resized URL when the post has a featured_image', () => {
		const featuredImage = 'https://example.com/featured.jpg';
		resizeImageUrl.mockReturnValue( 'https://example.com/featured.jpg?w=1200' );

		const { container } = render(
			<ReaderFullPostFeaturedImage post={ { featured_image: featuredImage } } maxWidth={ 600 } />
		);

		const img = container.querySelector( '.reader-full-post__featured-image img' );
		expect( img ).toBeTruthy();
		expect( img ).toHaveAttribute( 'src', 'https://example.com/featured.jpg?w=1200' );
		expect( resizeImageUrl ).toHaveBeenCalledWith( featuredImage, 600 );
	} );

	test( 'hides the wrapper when the image fails to load', () => {
		const nonExistentImage = 'http://sketchy-feed.com/missing-image-2.jpg';
		const { container } = render(
			<ReaderFullPostFeaturedImage post={ { featured_image: nonExistentImage } } maxWidth={ 600 } />
		);
		const div = container.getElementsByClassName( 'reader-full-post__featured-image' )[ 0 ];

		fireEvent.error( div.getElementsByTagName( 'img' )[ 0 ] );

		expect( getComputedStyle( div ).getPropertyValue( 'display' ) ).toBe( 'none' );
	} );
} );
