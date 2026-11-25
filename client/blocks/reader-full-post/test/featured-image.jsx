/**
 * @vitest-environment jsdom
 */
import { fireEvent, render } from '@testing-library/react';
import { vi } from 'vitest';
import resizeImageUrl from 'calypso/lib/resize-image-url';
import ReaderFullPostFeaturedImage from '../featured-image';

vi.mock( 'calypso/lib/resize-image-url', () => ( { default: vi.fn( ( url ) => url ) } ) );

describe( 'ReaderFullPostFeaturedImage', () => {
	const photonFeaturedImage = 'https://i0.wp.com/example.com/wp-content/uploads/featured.jpg?w=600';
	const postWithImageInContent = {
		featured_image: photonFeaturedImage,
		post_thumbnail: { URL: 'https://example.com/wp-content/uploads/featured.jpg' },
		images: [
			{ src: photonFeaturedImage },
			{ src: 'https://i0.wp.com/example.com/wp-content/uploads/featured.jpg?fit=600%2C300' },
		],
	};

	beforeEach( () => {
		resizeImageUrl.mockImplementation( ( url ) => url );
	} );

	test( 'returns null when the content shows a copy of the featured image', () => {
		const { container } = render(
			<ReaderFullPostFeaturedImage post={ postWithImageInContent } maxWidth={ 600 } />
		);

		expect( container ).toBeEmptyDOMElement();
	} );

	test( 'renders the featured image of an excerpt-only post whose content has a copy of it', () => {
		const { container } = render(
			<ReaderFullPostFeaturedImage
				post={ { ...postWithImageInContent, use_excerpt: true } }
				maxWidth={ 600 }
			/>
		);

		expect( container.querySelector( '.reader-full-post__featured-image img' ) ).toHaveAttribute(
			'src',
			photonFeaturedImage
		);
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
