/**
 * External dependencies
 */
import { connect } from 'react-redux';
import React, { FunctionComponent } from 'react';
import page from 'page';

/**
 * Internal dependencies
 */
import { useTranslate } from 'i18n-calypso';
import { SiteSlug } from 'types';
import { getSelectedSiteSlug } from 'state/ui/selectors';
import PromoSection, { Props as PromoSectionProps } from 'components/promo-section';

interface ConnectedProps {
	selectedSiteSlug: SiteSlug;
}

const Home: FunctionComponent< ConnectedProps > = ( { selectedSiteSlug } ) => {
	const translate = useTranslate();

	const promos: PromoSectionProps = {
		header: {
			title: translate( 'Start earning money' ),
			image: {
				path: '/calypso/images/earn/earn-section.svg',
			},
			body: translate( 'There is a range of ways to earn money through your WordPress.com Site.' ),
		},
		promos: [
			{
				title: translate( 'Collect one-time payments' ),
				body: translate(
					'Add a payment button to any post or page to collect PayPal payments for physical products, digital goods, services, or donations. Available to any site with a Premium plan.'
				),
				image: {
					path: '/calypso/images/earn/simple-payments.svg',
				},
				cta: {
					text: translate( 'Collect One-time Payments' ),
					action: '/',
				},
			},
			{
				title: translate( 'Collect recurring payments' ),
				body: translate(
					'Charge for services, collect membership dues, or take recurring donations. Automate recurring payments, and use your site to earn reliable revenue. Available to any site with a paid plan.'
				),
				image: {
					path: '/calypso/images/earn/recurring.svg',
				},
				cta: {
					text: translate( 'Collect Recurring Payments' ),
					action: () => page( `/earn/payments/${ selectedSiteSlug }` ),
				},
			},
		],
	};

	return <PromoSection { ...promos } />;
};

export default connect< ConnectedProps, {}, {} >( state => {
	return {
		selectedSiteSlug: getSelectedSiteSlug( state ),
	};
} )( Home );
