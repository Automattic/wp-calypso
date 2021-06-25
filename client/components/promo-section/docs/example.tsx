/**
 * External dependencies
 */
import React from 'react';

/**
 * Internal dependencies
 */
import PromoSection, { Props as PromoSectionProps } from 'calypso/components/promo-section';

/**
 * Image dependencies
 */
import earnSectionImage from 'calypso/assets/images/earn/earn-section.svg';
import recurringImage from 'calypso/assets/images/earn/recurring.svg';
import simplePaymentsImage from 'calypso/assets/images/earn/simple-payments.svg';

/* eslint-disable wpcalypso/jsx-classname-namespace */
const PromoSectionExample = () => {
	const promos: PromoSectionProps = {
		header: {
			title: 'Start earning money',
			image: {
				path: earnSectionImage,
			},
			body: 'There is a range of ways to earn money through your WordPress.com Site.',
		},
		promos: [
			{
				title: 'Collect one-time payments',
				body:
					'Add a payment button to any post or page to collect PayPal payments for physical products, digital goods, services, or donations. Available to any site with a Premium plan.',
				image: {
					path: simplePaymentsImage,
				},
				cta: {
					text: 'Collect One-time Payments',
					url: '/',
				},
			},
			{
				title: 'Collect payments',
				body:
					'Charge for services, collect membership dues, or take one-time or recurring donations. Automate recurring payments, and use your site to earn reliable revenue. Available to any site with a paid plan.',
				image: {
					path: recurringImage,
				},
				cta: {
					text: 'Collect Payments',
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
