/**
 * @jest-environment jsdom
 */
import { render, screen } from '@testing-library/react';
import { DiscoverLoggedOutHero } from '../index';

jest.mock( 'calypso/lib/analytics/tracks', () => ( {
	recordTracksEvent: jest.fn(),
} ) );

describe( 'DiscoverLoggedOutHero', () => {
	test( 'renders the headline, description, and signup CTA', () => {
		render( <DiscoverLoggedOutHero /> );

		expect(
			screen.getByRole( 'heading', { name: 'Discover your next favorite blog to read.' } )
		).toBeVisible();
		expect(
			screen.getByText( 'Explore popular blogs that inspire, educate, and entertain.' )
		).toBeVisible();

		const cta = screen.getByRole( 'link', { name: 'Start reading' } );
		expect( cta ).toBeVisible();
		expect( cta ).toHaveAttribute(
			'href',
			'/start/account/user-social?redirect_to=/discover&ref=reader-lp'
		);
	} );
} );
