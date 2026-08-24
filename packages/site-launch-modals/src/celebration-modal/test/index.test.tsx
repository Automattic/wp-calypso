/**
 * @jest-environment jsdom
 */

import { render, screen } from '@testing-library/react';
import CelebrationModal from '..';

jest.mock( 'canvas-confetti', () => jest.fn() );

describe( '<CelebrationModal>', () => {
	const baseProps = {
		siteDomain: 'example.com',
		siteUrl: 'https://example.com',
		upsellHref: '#',
		onUpsellClick: () => {},
		onClose: () => {},
	};

	test( 'renders the live site with copy-url and view-site actions', () => {
		render(
			<CelebrationModal { ...baseProps } hasCustomDomain isPaidPlan isBilledMonthly={ false } />
		);

		expect( screen.getByRole( 'dialog', { name: 'Congrats, your site is live!' } ) ).toBeVisible();
		expect( screen.getByText( 'example.com' ) ).toBeVisible();
		expect( screen.getByRole( 'button', { name: 'Copy URL' } ) ).toBeVisible();
		expect( screen.getByRole( 'link', { name: 'View site' } ) ).toBeVisible();
	} );

	test( 'offers the domain upsell for a free plan without a custom domain', () => {
		render(
			<CelebrationModal
				{ ...baseProps }
				hasCustomDomain={ false }
				isPaidPlan={ false }
				isBilledMonthly={ false }
				upsellHref="https://example.com/domains"
			/>
		);

		expect( screen.getByRole( 'link', { name: 'Get your domain' } ) ).toBeVisible();
	} );

	test( 'offers the annual-billing upsell for a monthly paid plan without a custom domain', () => {
		render(
			<CelebrationModal { ...baseProps } hasCustomDomain={ false } isPaidPlan isBilledMonthly />
		);

		expect( screen.getByText( /Interested in a custom domain/ ) ).toBeVisible();
		expect( screen.getByRole( 'link', { name: 'Get your domain' } ) ).toBeVisible();
	} );

	test( 'offers the free-domain upsell for an annually billed paid plan without a custom domain', () => {
		render(
			<CelebrationModal
				{ ...baseProps }
				hasCustomDomain={ false }
				isPaidPlan
				isBilledMonthly={ false }
			/>
		);

		expect( screen.getByRole( 'link', { name: 'Get your free domain' } ) ).toBeVisible();
	} );

	test( 'does not show an upsell when the site already has a custom domain', () => {
		render(
			<CelebrationModal { ...baseProps } hasCustomDomain isPaidPlan isBilledMonthly={ false } />
		);

		expect(
			screen.queryByRole( 'link', { name: /Get your (free )?domain/ } )
		).not.toBeInTheDocument();
	} );
} );
