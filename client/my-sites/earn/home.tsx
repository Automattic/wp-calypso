/**
 * External dependencies
 */
import { connect } from 'react-redux';
import React, { FunctionComponent, Fragment } from 'react';
import page from 'page';
import { get, compact } from 'lodash';

/**
 * Internal dependencies
 */
import { useTranslate } from 'i18n-calypso';
import { SiteSlug } from 'types';
import { getSelectedSiteSlug } from 'state/ui/selectors';
import getSiteBySlug from 'state/sites/selectors/get-site-by-slug';
import { hasFeature, getCurrentPlan } from 'state/sites/plans/selectors';
import { isJetpackSite } from 'state/sites/selectors';
import { isRequestingWordAdsApprovalForSite } from 'state/wordads/approve/selectors';
import PromoSection, { Props as PromoSectionProps } from 'components/promo-section';
import QueryMembershipsSettings from 'components/data/query-memberships-settings';
import QueryWordadsStatus from 'components/data/query-wordads-status';
import {
	FEATURE_WORDADS_INSTANT,
	FEATURE_SIMPLE_PAYMENTS,
	FEATURE_UPLOAD_PLUGINS,
	PLAN_FREE,
} from 'lib/plans/constants';

interface ConnectedProps {
	siteId: number;
	selectedSiteSlug: SiteSlug;
	isAJetpackSite: boolean;
	isFreePlan: boolean;
	hasSimplePayments: boolean;
	hasWordAds: boolean;
	hasUploadPlugins: boolean;
	hasConnectedAccount: boolean;
	hasSetupAds: boolean;
}

const Home: FunctionComponent< ConnectedProps > = ( {
	siteId,
	selectedSiteSlug,
	isAJetpackSite,
	isFreePlan,
	hasSimplePayments,
	hasWordAds,
	hasUploadPlugins,
	hasConnectedAccount,
	hasSetupAds,
} ) => {
	const translate = useTranslate();

	/**
	 * Return the content to display in the Simple Payments card based on the current plan.
	 *
	 * @returns {object} Object with props to render a PromoCard.
	 */
	const getSimplePaymentsCard = () => {
		const supportLink =
			'https://en.support.wordpress.com/wordpress-editor/blocks/simple-payments-block/';
		const cta = hasSimplePayments
			? {
					text: translate( 'Collect One-time Payments' ),
					action: supportLink,
			  }
			: {
					text: translate( 'Upgrade to Premium Plan' ),
					action: () => page( `/checkout/${ selectedSiteSlug }/premium/` ),
			  };
		const learnMoreLink = hasSimplePayments ? null : supportLink;
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
			cta,
			learnMoreLink,
		};
	};

	/**
	 * Return the content to display in the Recurring Payments card based on the current plan.
	 *
	 * @returns {object} Object with props to render a PromoCard.
	 */
	const getRecurringPaymentsCard = () => {
		const cta = isFreePlan
			? {
					text: translate( 'Upgrade to a Paid Plan' ),
					action: () => page( `/plans/${ selectedSiteSlug }` ),
			  }
			: {
					text: translate( 'Collect Recurring Payments' ),
					action: () => page( `/earn/payments/${ selectedSiteSlug }` ),
			  };
		const title = hasConnectedAccount
			? translate( 'Manage Recurring Payments' )
			: translate( 'Collect recurring payments' );
		const body = hasConnectedAccount
			? translate(
					"Manage your subscribers, or your current subscription options and review the total revenue that you've made from recurring payments."
			  )
			: translate(
					'Charge for services, collect membership dues, or take recurring donations. Automate recurring payments, and use your site to earn reliable revenue. {{em}}Available to any site with a paid plan{{/em}}.',
					{
						components: {
							em: <em />,
						},
					}
			  );
		const learnMoreLink = isFreePlan
			? 'https://en.support.wordpress.com/recurring-payments/'
			: null;
		return {
			title,
			body,
			image: {
				path: '/calypso/images/earn/recurring.svg',
			},
			cta,
			learnMoreLink,
		};
	};

	/**
	 * Return the content to display in the Store card based on the current plan.
	 *
	 * @returns {object} Object with props to render a PromoCard.
	 */
	const getStoreCard = () => {
		if ( isAJetpackSite ) {
			return null;
		}

		const cta = hasUploadPlugins
			? {
					text: translate( 'Set Up a Simple Store' ),
					action: () => page( `/store/${ selectedSiteSlug }` ),
			  }
			: {
					text: translate( 'Upgrade to Business Plan' ),
					action: () => page( `/checkout/${ selectedSiteSlug }/business/` ),
			  };
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
			cta,
			learnMoreLink: 'https://en.support.wordpress.com/store/',
		};
	};

	/**
	 * Return the content to display in the Ads card based on the current plan.
	 *
	 * @returns {object} Object with props to render a PromoCard.
	 */
	const getAdsCard = () => {
		const cta = hasWordAds
			? {
					text: hasSetupAds ? translate( 'View Ad Dashboard' ) : translate( 'Earn Ad Revenue' ),
					action: () =>
						page(
							`/earn/${ hasSetupAds ? 'ads-earnings' : 'ads-settings' }/${ selectedSiteSlug }`
						),
			  }
			: {
					text: translate( 'Upgrade to Premium Plan' ),
					action: () => page( `/checkout/${ selectedSiteSlug }/premium/` ),
			  };
		const title = hasSetupAds ? translate( 'View Ad Dashboard' ) : translate( 'Earn ad revenue' );
		const body = hasSetupAds
			? translate(
					"Check out your ad earnings history, including total earnings, total paid to date, and the amount that you've still yet to be paid."
			  )
			: translate(
					'Publish as you normally would, display advertisements on all your posts and pages, and make money each time someone visits your site. {{em}}Available to sites with a Premium plan{{/em}}.',
					{
						components: {
							em: <em />,
						},
					}
			  );
		const learnMoreLink = ! hasWordAds ? 'https://wordads.co/' : null;
		return {
			title,
			body,
			image: {
				path: '/calypso/images/earn/ads.svg',
			},
			cta,
			learnMoreLink,
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
		promos: compact( [
			getSimplePaymentsCard(),
			getRecurringPaymentsCard(),
			getStoreCard(),
			getAdsCard(),
		] ),
	};

	return (
		<Fragment>
			{ ! hasWordAds && <QueryWordadsStatus siteId={ siteId } /> }
			{ ! isFreePlan && <QueryMembershipsSettings siteId={ siteId } /> }
			<PromoSection { ...promos } />
		</Fragment>
	);
};

export default connect< ConnectedProps, {}, {} >( state => {
	const selectedSiteSlug = getSelectedSiteSlug( state );
	const site = getSiteBySlug( state, selectedSiteSlug );
	const plan = getCurrentPlan( state, site.ID );
	return {
		siteId: site.ID,
		selectedSiteSlug,
		isFreePlan: get( plan, 'productSlug', '' ) === PLAN_FREE,
		hasWordAds: hasFeature( state, site.ID, FEATURE_WORDADS_INSTANT ),
		hasUploadPlugins: hasFeature( state, site.ID, FEATURE_UPLOAD_PLUGINS ),
		hasSimplePayments: hasFeature( state, site.ID, FEATURE_SIMPLE_PAYMENTS ),
		isAJetpackSite: isJetpackSite( state, site.ID ),
		hasConnectedAccount:
			null !== get( state, [ 'memberships', 'settings', site.ID, 'connectedAccountId' ], null ),
		hasSetupAds: site.options.wordads || isRequestingWordAdsApprovalForSite( state, site ),
	};
} )( Home );
