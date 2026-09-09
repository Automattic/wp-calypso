/**
 * @jest-environment jsdom
 */

import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
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

		const viewSite = screen.getByRole( 'link', { name: 'View site' } );
		expect( viewSite ).toHaveAttribute( 'href', 'https://example.com' );
		expect( viewSite ).toHaveAttribute( 'target', '_blank' );
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

		const upsell = screen.getByRole( 'link', { name: 'Get your domain' } );
		expect( upsell ).toBeVisible();
		expect( upsell ).toHaveAttribute( 'href', 'https://example.com/domains' );
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

	test( 'copies the site domain to the clipboard and marks the button as copied', async () => {
		const user = userEvent.setup();
		render(
			<CelebrationModal { ...baseProps } hasCustomDomain isPaidPlan isBilledMonthly={ false } />
		);

		await user.click( screen.getByRole( 'button', { name: 'Copy URL' } ) );

		expect( await navigator.clipboard.readText() ).toBe( 'example.com' );
		expect( screen.getByRole( 'button', { name: 'Copy URL' } ) ).toHaveAttribute(
			'title',
			'Copied!'
		);
	} );

	test( 'fires onUpsellClick when the upsell button is clicked', async () => {
		const user = userEvent.setup();
		const onUpsellClick = jest.fn();
		render(
			<CelebrationModal
				{ ...baseProps }
				hasCustomDomain={ false }
				isPaidPlan={ false }
				isBilledMonthly={ false }
				onUpsellClick={ onUpsellClick }
			/>
		);

		await user.click( screen.getByRole( 'link', { name: 'Get your domain' } ) );

		expect( onUpsellClick ).toHaveBeenCalledTimes( 1 );
	} );
} );
