/**
 * @jest-environment jsdom
 */
import '@testing-library/jest-dom';
import { render, screen } from '@testing-library/react';
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
} );
