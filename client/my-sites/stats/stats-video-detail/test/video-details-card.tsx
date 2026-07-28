/**
 * @jest-environment jsdom
 */
import { fireEvent, render, screen } from '@testing-library/react';
import VideoDetailsCard from '../video-details-card';

const POSTER = 'https://videos.files.wordpress.com/abc123/poster.jpg';

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
		expect( getCard( container ) ).toHaveClass( 'has-thumbnail' );
		expect( screen.getByText( 'My video' ) ).toBeInTheDocument();
	} );

	test( 'drops back to the text-only layout when the poster fails to load', () => {
		const { container } = render(
			<VideoDetailsCard title="My video" date={ null } poster={ POSTER } />
		);

		fireEvent.error( container.querySelector( 'img.stats-video-details-card__thumbnail' )! );

		expect( container.querySelector( 'img' ) ).toBeNull();
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
