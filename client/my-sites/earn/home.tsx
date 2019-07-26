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
import getSiteBySlug from 'state/sites/selectors/get-site-by-slug';
import { getCurrentPlan } from 'state/sites/plans/selectors';
import PromoSection, { Props as PromoSectionProps } from 'components/promo-section';
import { PLAN_FREE, PLAN_PREMIUM, PLAN_BUSINESS } from 'lib/plans/constants';

interface ConnectedProps {
	selectedSiteSlug: SiteSlug;
	currentPlan: string;
}

const Home: FunctionComponent< ConnectedProps > = ( { selectedSiteSlug, currentPlan } ) => {
	const translate = useTranslate();

	/**
	 * Return the content to display in the Simple Payments card based on the current plan.
	 *
	 * @returns {object} Object with props to render a PromoCard.
	 */
	const getSimplePaymentsCard = () => {
		console.log( currentPlan );
		// Todo: get plan and return different content based on it.
		return {
			title: translate( 'Collect one-time payments' ),
			body: translate(
				'Add a payment button to any post or page to collect PayPal payments for physical products, digital goods, services, or donations. {{em}}Available to any site with a Premium plan{{/em}}.',
				{
					components: {
						em: <em />,
					},
				}
			),
			image: {
				path: '/calypso/images/earn/simple-payments.svg',
			},
			cta: {
				text: translate( 'Collect One-time Payments' ),
				action: '/',
			},
			learnMoreLink:
				'https://en.support.wordpress.com/wordpress-editor/blocks/simple-payments-block/',
		};
	};

	/**
	 * Return the content to display in the Recurring Payments card based on the current plan.
	 *
	 * @returns {object} Object with props to render a PromoCard.
	 */
	const getRecurringPaymentsCard = () => {
		// Todo: get plan and return different content based on it.
		return {
			title: translate( 'Collect recurring payments' ),
			body: translate(
				'Charge for services, collect membership dues, or take recurring donations. Automate recurring payments, and use your site to earn reliable revenue. {{em}}Available to any site with a paid plan{{/em}}.',
				{
					components: {
						em: <em />,
					},
				}
			),
			image: {
				path: '/calypso/images/earn/recurring.svg',
			},
			cta: {
				text: translate( 'Collect Recurring Payments' ),
				action: () => page( `/earn/payments/${ selectedSiteSlug }` ),
			},
			learnMoreLink: 'https://en.support.wordpress.com/recurring-payments/',
		};
	};

	/**
	 * Return the content to display in the Recurring Payments card based on the current plan.
	 *
	 * @returns {object} Object with props to render a PromoCard.
	 */
	const getStoreCard = () => {
		// Todo: get plan and return different content based on it.
		return {
			title: translate( 'Sell a few items' ),
			body: translate(
				'Create a basic store with minimal setup -- add your products, and use the built-in shipping, coupon, and tax tools. {{em}}Available to sites with a Business plan{{/em}}.',
				{
					components: {
						em: <em />,
					},
				}
			),
			image: {
				path: '/calypso/images/earn/woo.svg',
			},
			cta: {
				text: translate( 'Upgrade to Premium Plan' ),
				action: () => page( `/checkout/${ selectedSiteSlug }/business/` ),
			},
			learnMoreLink: 'https://en.support.wordpress.com/store/',
		};
	};

	/**
	 * Return the content to display in the Ads card based on the current plan.
	 *
	 * @returns {object} Object with props to render a PromoCard.
	 */
	const getAdsCard = () => {
		// Todo: get plan and return different content based on it.
		return {
			title: translate( 'Earn ad revenue' ),
			body: translate(
				'Publish as you normally would, display advertisements on all your posts and pages, and make money each time someone visits your site. {{em}}Available to sites with a Premium plan{{/em}}.',
				{
					components: {
						em: <em />,
					},
				}
			),
			image: {
				path: '/calypso/images/earn/ads.svg',
			},
			cta: {
				text: translate( 'Upgrade to Premium Plan' ),
				action: () => page( `/checkout/${ selectedSiteSlug }/business/` ),
			},
			learnMoreLink: 'https://wordads.co/',
		};
	};

	const promos: PromoSectionProps = {
		header: {
			title: translate( 'Start earning money' ),
			image: {
				path: '/calypso/images/earn/earn-section.svg',
			},
			body: translate( 'There is a range of ways to earn money through your WordPress.com Site.' ),
		},
		promos: [ getSimplePaymentsCard(), getRecurringPaymentsCard(), getStoreCard(), getAdsCard() ],
	};

	return <PromoSection { ...promos } />;
};

export default connect< ConnectedProps, {}, {} >( state => {
	const selectedSiteSlug = getSelectedSiteSlug( state );
	const site = getSiteBySlug( state, selectedSiteSlug );
	return {
		selectedSiteSlug,
		currentPlan: getCurrentPlan( state, site.ID ),
	};
} )( Home );
