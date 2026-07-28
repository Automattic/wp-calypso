/**
 * @jest-environment jsdom
 */
import { fireEvent, render, screen } from '@testing-library/react';
import VideoDetailsCard from '../video-details-card';

const POSTER = 'https://videos.files.wordpress.com/abc123/poster.jpg';
const MEDIA_URL = '/media/example.com/123';

function getCard( container: HTMLElement ) {
	return container.querySelector( '.stats-video-details-card' );
}

describe( 'VideoDetailsCard', () => {
	test( 'renders the poster as a decorative image with the thumbnail layout', () => {
		const { container } = render(
			<VideoDetailsCard title="My video" date={ null } poster={ POSTER } />
		);

		const img = container.querySelector( 'img.stats-video-details-card__thumbnail' );
		expect( img ).toHaveAttribute( 'src', POSTER );
		expect( img ).toHaveAttribute( 'alt', '' );
		expect( container.querySelector( 'a' ) ).toBeNull();
		expect( getCard( container ) ).toHaveClass( 'has-thumbnail' );
		expect( screen.getByText( 'My video' ) ).toBeInTheDocument();
	} );

	test( 'links the thumbnail to the media library when a URL is provided', () => {
		const { container } = render(
			<VideoDetailsCard
				title="My video"
				date={ null }
				poster={ POSTER }
				mediaLibraryUrl={ MEDIA_URL }
			/>
		);

		const link = screen.getByRole( 'link', {
			name: 'View the video in the media library (opens in a new tab)',
		} );
		expect( link ).toHaveAttribute( 'href', MEDIA_URL );
		expect( link ).toHaveAttribute( 'target', '_blank' );
		expect( link ).toHaveAttribute( 'rel', 'noopener noreferrer' );
		expect( link.querySelector( 'img.stats-video-details-card__thumbnail' ) ).toHaveAttribute(
			'alt',
			''
		);
		expect( getCard( container ) ).toHaveClass( 'has-thumbnail' );
	} );

	test( 'drops back to the text-only layout when the poster fails to load', () => {
		const { container } = render(
			<VideoDetailsCard
				title="My video"
				date={ null }
				poster={ POSTER }
				mediaLibraryUrl={ MEDIA_URL }
			/>
		);

		fireEvent.error( container.querySelector( 'img.stats-video-details-card__thumbnail' )! );

		expect( container.querySelector( 'img' ) ).toBeNull();
		expect( container.querySelector( 'a' ) ).toBeNull();
		expect( getCard( container ) ).not.toHaveClass( 'has-thumbnail' );
		expect( screen.getByText( 'My video' ) ).toBeInTheDocument();
	} );

	test( 'keeps the text-only layout when there is no poster', () => {
		const { container } = render( <VideoDetailsCard title="My video" date={ null } /> );

		expect( container.querySelector( 'img' ) ).toBeNull();
		expect( getCard( container ) ).not.toHaveClass( 'has-thumbnail' );
		expect( screen.getByText( 'My video' ) ).toBeInTheDocument();
	} );
} );
