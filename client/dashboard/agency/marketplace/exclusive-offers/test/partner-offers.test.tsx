/**
 * @vitest-environment jsdom
 */
import '@testing-library/jest-dom';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { vi } from 'vitest';
import PartnerOffers from '../partner-offers';

const LINKS = {
	hostingWpcom: '/marketplace/hosting/wpcom',
	hostingPressable: '/marketplace/hosting/pressable',
	referPressablePremium: '/marketplace/hosting/refer-pressable-premium-plan',
	referEnterprise: '/marketplace/hosting/refer-enterprise-hosting',
	products: '/marketplace/products',
	woopayments: '/woopayments/overview',
};

describe( '<PartnerOffers>', () => {
	test( 'renders plain anchors for in-app CTAs without a router', () => {
		render( <PartnerOffers links={ LINKS } shouldUseRouterLink={ false } /> );

		expect( screen.getByRole( 'link', { name: 'Refer WordPress VIP' } ) ).toHaveAttribute(
			'href',
			'/marketplace/hosting/refer-enterprise-hosting'
		);
		expect( screen.getByRole( 'link', { name: 'Earn with WooPayments' } ) ).toHaveAttribute(
			'href',
			'/woopayments/overview'
		);
		expect( screen.getAllByRole( 'link', { name: 'Refer Woo' } )[ 0 ] ).toHaveAttribute(
			'href',
			'/marketplace/products?category=woocommerce'
		);
	} );

	test( 'lists Avalara under trusted partners instead of the exclusive offers', () => {
		render( <PartnerOffers links={ LINKS } shouldUseRouterLink={ false } /> );

		expect( screen.getByRole( 'heading', { name: 'Trusted partners' } ) ).toBeVisible();
		expect( screen.getByRole( 'link', { name: 'Explore ShipStation' } ) ).toHaveAttribute(
			'href',
			'https://www.shipstation.com/partnership-options/'
		);
		expect( screen.getByRole( 'link', { name: 'Explore Packlink PRO' } ) ).toHaveAttribute(
			'href',
			'https://partners.auctane.com'
		);
		expect( screen.getAllByRole( 'link', { name: 'Explore Avalara' } ) ).toHaveLength( 1 );
	} );

	test( 'records a dedicated event when a trusted partner CTA is clicked', async () => {
		const recordTracksEvent = vi.fn();
		render(
			<PartnerOffers
				links={ LINKS }
				shouldUseRouterLink={ false }
				recordTracksEvent={ recordTracksEvent }
			/>
		);

		await userEvent.click( screen.getByRole( 'link', { name: 'Explore Avalara' } ) );

		expect( recordTracksEvent ).toHaveBeenCalledWith( 'calypso_a4a_exclusive_offers_cta_click', {
			offer_id: 'avalara-partner-program-refer',
		} );
		expect( recordTracksEvent ).toHaveBeenCalledWith(
			'calypso_a4a_exclusive_offers_trusted_partner_avalara_click'
		);
	} );
} );
