/** @format */

/**
 * External dependencies
 */
import React from 'react';

/**
 * Internal dependencies
 */
import PromoSection, { Props as PromoSectionProps } from 'components/promo-section';

/* eslint-disable wpcalypso/jsx-classname-namespace */
const PromoSectionExample = () => {
	const promos: PromoSectionProps = {
		header: {
			title: 'Start earning money',
			image: {
				path: '/calypso/images/earn/earn-section.svg',
			},
			body: 'There is a range of ways to earn money through your WordPress.com Site.',
		},
		promos: [
			{
				title: 'Collect one-time payments',
				body:
					'Add a payment button to any post or page to collect PayPal payments for physical products, digital goods, services, or donations. Available to any site with a Premium plan.',
				image: {
					path: '/calypso/images/earn/simple-payments.svg',
				},
				cta: {
					text: 'Collect One-time Payments',
					url: '/',
				},
			},
			{
				title: 'Collect recurring payments',
				body:
					'Charge for services, collect membership dues, or take recurring donations. Automate recurring payments, and use your site to earn reliable revenue. Available to any site with a paid plan.',
				image: {
					path: '/calypso/images/earn/recurring.svg',
				},
				cta: {
					text: 'Collect Recurring Payments',
					url: '/',
				},
			},
		],
	};

	return (
		<div className="design-assets__group">
			<PromoSection { ...promos } />
		</div>
	);
};
/* eslint-enable wpcalypso/jsx-classname-namespace */

PromoSectionExample.displayName = 'PromoSection';

export default PromoSectionExample;
