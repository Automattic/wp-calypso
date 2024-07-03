import { render, screen } from '@testing-library/react';
import React from 'react';
import BadgeContainer from '../index';

describe( '<BadgeContainer /> integration', () => {
	beforeEach( () => {
		jest.clearAllMocks();
	} );

	it( 'should render the premium badge', async () => {
		render( <BadgeContainer badgeType="premium" isPremiumThemeAvailable /> );

		const premiumBadge = await screen.findByText( 'Premium' );

		expect( premiumBadge ).toBeTruthy();
	} );

	it( 'should not render badges', async () => {
		const renderedContent = render( <BadgeContainer /> );

		const premiumBadge = renderedContent.container.querySelector( '.premium-badge' );

		expect( premiumBadge ).toBeFalsy();
	} );
} );
