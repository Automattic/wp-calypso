/**
 * @jest-environment jsdom
 */
import { render, screen } from '@testing-library/react';
import { P2Thumbnail } from '../p2-thumbnail';
import type { P2ThumbnailElements } from '@automattic/data-stores/src/site/types';
import type { SiteExcerptData } from '@automattic/sites';

function makeTestSite( {
	p2_thumbnail_elements,
	icon,
}: {
	p2_thumbnail_elements: P2ThumbnailElements | undefined;
	icon?: string;
} ): SiteExcerptData {
	return {
		ID: 1,
		title: 'test',
		name: 'test',
		slug: '',
		URL: '',
		launch_status: 'launched',
		options: {},
		jetpack: false,
		is_coming_soon: false,
		lang: 'en',
		p2_thumbnail_elements,
		icon: icon ? { ico: '', img: icon, media_id: 0 } : undefined,
	};
}

describe( '<P2Thumbnail>', () => {
	test( 'render nothing when p2_thumbnail_elements is missing', () => {
		const { container } = render(
			<P2Thumbnail
				displayMode="list"
				alt="alt"
				site={ makeTestSite( { p2_thumbnail_elements: undefined } ) }
			/>
		);
		expect( container ).toBeEmptyDOMElement();
	} );

	test( 'alt text applied to whole image, not sub-images', () => {
		const p2_thumbnail_elements = {
			header_image: 'https://example.com/header.jpg',
			color_link: 'unused',
			color_sidebar_background: 'unused',
		};
		const { container } = render(
			<P2Thumbnail
				displayMode="list"
				alt="test text"
				site={ makeTestSite( { p2_thumbnail_elements, icon: 'https://example.com/icon.jpg' } ) }
			/>
		);
		expect( screen.getByRole( 'img', { name: 'test text' } ) ).toBeInTheDocument();
		expect(
			container.querySelector( '[src="https://example.com/header.jpg"]' )?.getAttribute( 'alt' )
		).toBeFalsy();
		expect(
			container.querySelector( '[src="https://example.com/icon.jpg"]' )?.getAttribute( 'alt' )
		).toBeFalsy();
	} );

	test( 'requests smaller header image when we know ?w param is supported', () => {
		const p2_thumbnail_elements = {
			header_image: 'https://example.files.wordpress.com/header.jpg',
			color_link: 'unused',
			color_sidebar_background: 'unused',
		};
		const { container } = render(
			<P2Thumbnail
				displayMode="list"
				alt="test text"
				site={ makeTestSite( { p2_thumbnail_elements } ) }
			/>
		);
		const headerImage = container.querySelector(
			'[src="https://example.files.wordpress.com/header.jpg?w=106"]'
		);
		expect( headerImage ).toBeInTheDocument();

		// Requests retina too
		expect( headerImage?.getAttribute( 'srcset' ) ).toBe(
			'https://example.files.wordpress.com/header.jpg?w=212 2x'
		);
	} );

	test( 'does not request specific header size when ?w param might not be supported', () => {
		const p2_thumbnail_elements = {
			header_image: 'https://example.com/header.jpg',
			color_link: 'unused',
			color_sidebar_background: 'unused',
		};
		const { container } = render(
			<P2Thumbnail
				displayMode="list"
				alt="test text"
				site={ makeTestSite( { p2_thumbnail_elements } ) }
			/>
		);
		const headerImage = container.querySelector( '[src="https://example.com/header.jpg"]' );
		expect( headerImage ).toBeInTheDocument();

		// Don't request retina when we're already requesting the maximum image size
		expect( headerImage?.getAttribute( 'srcset' ) ).toBeFalsy();
	} );

	test( 'requests smaller icon when we know ?w param is supported', () => {
		const p2_thumbnail_elements = {
			header_image: null,
			color_link: 'unused',
			color_sidebar_background: 'unused',
		};
		const { container } = render(
			<P2Thumbnail
				displayMode="tile"
				alt="test text"
				site={ makeTestSite( {
					p2_thumbnail_elements,
					icon: 'https://example.files.wordpress.com/icon.jpg',
				} ) }
			/>
		);
		const iconImage = container.querySelector(
			'[src="https://example.files.wordpress.com/icon.jpg?w=64"]'
		);
		expect( iconImage ).toBeInTheDocument();

		// Requests retina too
		expect( iconImage?.getAttribute( 'srcset' ) ).toBe(
			'https://example.files.wordpress.com/icon.jpg?w=128 2x'
		);
	} );

	test( 'requests smaller icon when we know ?s param is supported', () => {
		const p2_thumbnail_elements = {
			header_image: null,
			color_link: 'unused',
			color_sidebar_background: 'unused',
		};
		const { container } = render(
			<P2Thumbnail
				displayMode="list"
				alt="test text"
				site={ makeTestSite( {
					p2_thumbnail_elements,
					icon: 'https://secure.gravatar.com/blavatar/1234',
				} ) }
			/>
		);
		const iconImage = container.querySelector(
			'[src="https://secure.gravatar.com/blavatar/1234?s=32"]'
		);
		expect( iconImage ).toBeInTheDocument();

		// Requests retina too
		expect( iconImage?.getAttribute( 'srcset' ) ).toBe(
			'https://secure.gravatar.com/blavatar/1234?s=64 2x'
		);
	} );

	test( 'does not request specific icon size when ?w and ?s params might not be supported', () => {
		const p2_thumbnail_elements = {
			header_image: null,
			color_link: 'unused',
			color_sidebar_background: 'unused',
		};
		const { container } = render(
			<P2Thumbnail
				displayMode="list"
				alt="test text"
				site={ makeTestSite( { p2_thumbnail_elements, icon: 'https://example.com/icon.jpg' } ) }
			/>
		);
		const iconImage = container.querySelector( '[src="https://example.com/icon.jpg"]' );
		expect( iconImage ).toBeInTheDocument();

		// Don't request retina when we're already requesting the maximum image size
		expect( iconImage?.getAttribute( 'srcset' ) ).toBeFalsy();
	} );

	test( 'pass sizesAttr to sizes attribute to the header image', () => {
		const p2_thumbnail_elements = {
			header_image: 'https://example.com/header.jpg',
			color_link: 'unused',
			color_sidebar_background: 'unused',
		};
		const sizes = 'sizes string';
		const { container } = render(
			<P2Thumbnail
				displayMode="tile"
				alt="test text"
				site={ makeTestSite( { p2_thumbnail_elements, icon: 'https://example.com/icon.jpg' } ) }
				sizesAttr={ sizes }
			/>
		);

		expect(
			container.querySelector( '[src="https://example.com/header.jpg"]' )?.getAttribute( 'sizes' )
		).toBe( sizes );

		// sizesAttr isn't applicable for the site icon
		const iconImage = container.querySelector( '[src="https://example.com/icon.jpg"]' );
		expect( iconImage ).toBeInTheDocument();
		expect( iconImage?.getAttribute( 'sizes' ) ).not.toBe( sizes );
	} );
} );
