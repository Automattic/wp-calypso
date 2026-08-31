/**
 * @jest-environment jsdom
 */
import { render, screen } from '@testing-library/react';
import { DiscoverLoggedOutHero } from '../index';

describe( 'DiscoverLoggedOutHero', () => {
	test( 'renders the headline and description', () => {
		render( <DiscoverLoggedOutHero /> );

		expect(
			screen.getByRole( 'heading', { name: 'Discover your next favorite blog to read.' } )
		).toBeVisible();
		expect(
			screen.getByText( 'Explore popular blogs that inspire, educate, and entertain.' )
		).toBeVisible();
	} );
} );
