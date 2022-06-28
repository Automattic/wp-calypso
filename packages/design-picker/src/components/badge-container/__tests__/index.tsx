import { render, screen } from '@testing-library/react';
import React from 'react';
import BadgeContainer from '../index';

jest.mock( '@automattic/calypso-config', () => ( {
	isEnabled: jest.fn().mockImplementation( ( feature: string ) => {
		switch ( feature ) {
			case 'gutenboarding/alpha-templates':
				return true;
			default:
				return false;
		}
	} ),
	__esModule: true,
	default: function config( key: string ) {
		return key;
	},
} ) );

describe( '<BadgeContainer /> integration', () => {
	beforeEach( () => {
		jest.clearAllMocks();
	} );

	it( 'should render the premium badge', async () => {
		render( <BadgeContainer badgeType="premium" isPremiumThemeAvailable={ true } /> );

		const premiumBadge = await screen.findByText( 'Premium' );

		expect( premiumBadge ).toBeTruthy();
	} );

	it( 'should not render badges, but the svg', async () => {
		const renderedContent = render( <BadgeContainer /> );

		const foundSvg = renderedContent.container.querySelector( 'svg' );
		const premiumBadge = renderedContent.container.querySelector( '.premium-badge' );

		expect( foundSvg ).toBeTruthy();
		expect( premiumBadge ).toBeFalsy();
	} );
} );
