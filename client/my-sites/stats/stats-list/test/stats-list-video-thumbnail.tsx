/**
 * @jest-environment jsdom
 */
import { fireEvent, render } from '@testing-library/react';
import StatsListVideoThumbnail from '../stats-list-video-thumbnail';

const POSTER = 'https://videos.files.wordpress.com/abc123/poster.jpg';

describe( 'StatsListVideoThumbnail', () => {
	test( 'renders the poster as a decorative image', () => {
		const { container } = render( <StatsListVideoThumbnail poster={ POSTER } /> );

		const img = container.querySelector( 'img.stats-list__video-thumbnail-image' );
		expect( img ).toHaveAttribute( 'src', POSTER );
		expect( img ).toHaveAttribute( 'alt', '' );
		expect( container.querySelector( 'svg' ) ).toBeNull();
	} );

	test( 'renders the placeholder when there is no poster', () => {
		const { container } = render( <StatsListVideoThumbnail poster={ null } /> );

		expect( container.querySelector( 'img' ) ).toBeNull();
		expect( container.querySelector( 'svg' ) ).toBeVisible();
	} );

	test( 'swaps in the placeholder when the poster fails to load', () => {
		const { container } = render( <StatsListVideoThumbnail poster={ POSTER } /> );

		fireEvent.error( container.querySelector( 'img.stats-list__video-thumbnail-image' )! );

		expect( container.querySelector( 'img' ) ).toBeNull();
		expect( container.querySelector( 'svg' ) ).toBeVisible();
	} );

	test( 'keeps the slot reserved in every state', () => {
		const withPoster = render( <StatsListVideoThumbnail poster={ POSTER } /> );
		const withoutPoster = render( <StatsListVideoThumbnail poster={ null } /> );

		expect( withPoster.container.querySelector( '.stats-list__video-thumbnail' ) ).toBeVisible();
		expect( withoutPoster.container.querySelector( '.stats-list__video-thumbnail' ) ).toBeVisible();
	} );
} );
