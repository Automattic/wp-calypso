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
import { hasFeature } from 'state/sites/plans/selectors';
import { isCurrentPlanPaid } from 'state/sites/selectors';
import { isRequestingWordAdsApprovalForSite } from 'state/wordads/approve/selectors';
import PromoSection, { Props as PromoSectionProps } from 'components/promo-section';
import QueryMembershipsSettings from 'components/data/query-memberships-settings';
import QueryWordadsStatus from 'components/data/query-wordads-status';
import { FEATURE_WORDADS_INSTANT, FEATURE_SIMPLE_PAYMENTS } from 'lib/plans/constants';
import { bumpStat, composeAnalytics, recordTracksEvent } from 'state/analytics/actions';

interface ConnectedProps {
	siteId: number;
	selectedSiteSlug: SiteSlug;
	isFreePlan: boolean;
	hasSimplePayments: boolean;
	hasWordAds: boolean;
	hasConnectedAccount: boolean;
	hasSetupAds: boolean;
	trackUpgrade: ( plan: string, feature: string ) => void;
	trackLink: ( feature: string ) => void;
}

const Home: FunctionComponent< ConnectedProps > = ( {
	siteId,
	selectedSiteSlug,
	isFreePlan,
	hasSimplePayments,
	hasWordAds,
	hasConnectedAccount,
	hasSetupAds,
	trackUpgrade,
	trackLink,
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
					action: { url: supportLink, onClick: () => trackLink( 'simple-payments' ) },
			  }
			: {
					text: translate( 'Upgrade to a Premium Plan!' ),
					action: () => {
						trackUpgrade( 'premium', 'simple-payments' );
						page( `/checkout/${ selectedSiteSlug }/premium/` );
					},
			  };
		const learnMoreLink = hasSimplePayments
			? null
			: { url: supportLink, onClick: () => trackLink( 'simple-payments' ) };
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
			ctaProps: {
				cta,
				learnMoreLink,
			},
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
					action: () => {
						trackUpgrade( 'any-paid-plan', 'recurring-payments' );
						page( `/plans/${ selectedSiteSlug }` );
					},
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
			? {
					url: 'https://en.support.wordpress.com/recurring-payments/',
					onClick: () => trackLink( 'recurring-payments' ),
			  }
			: null;
		return {
			title,
			body,
			image: {
				path: '/calypso/images/earn/recurring.svg',
			},
			ctaProps: {
				cta,
				learnMoreLink,
			},
		};
	};

	/**
	 * Return the content to display in the Referrals card based on the current plan.
	 *
	 * @returns {object} Object with props to render a PromoCard.
	 */
	const getReferralsCard = () => {
		const cta = {
			text: translate( 'Earn Cash from Referrals' ),
			action: { url: 'https://refer.wordpress.com/', onClick: () => trackLink( 'referral' ) },
		};
		return {
			title: translate( 'Earn cash from referrals' ),
			body: translate(
				"Promote WordPress.com to friends, family, and website visitors and you'll earn a referral payment for every paying customer you send our way. {{em}}Available on every plan{{/em}}.",
				{
					components: {
						em: <em />,
					},
				}
			),
			image: {
				path: '/calypso/images/earn/referral.svg',
			},
			ctaProps: {
				cta,
			},
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
					text: translate( 'Upgrade to a Premium Plan!' ),
					action: () => {
						trackUpgrade( 'premium', 'ads' );
						page( `/checkout/${ selectedSiteSlug }/premium/` );
					},
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
		const learnMoreLink = ! hasWordAds
			? { url: 'https://wordads.co/', onClick: () => trackLink( 'ads' ) }
			: null;
		return {
			title,
			body,
			image: {
				path: '/calypso/images/earn/ads.svg',
			},
			ctaProps: {
				cta,
				learnMoreLink,
			},
		};
	};

	const promos: PromoSectionProps = {
		header: {
			title: translate( 'Start earning money now' ),
			image: {
				path: '/calypso/images/earn/earn-section.svg',
			},
			body: translate( 'There is a range of ways to earn money through your WordPress site.' ),
		},
		promos: compact( [
			getSimplePaymentsCard(),
			getRecurringPaymentsCard(),
			getAdsCard(),
			getReferralsCard(),
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

export default connect< ConnectedProps, {}, {} >(
	state => {
		const selectedSiteSlug = getSelectedSiteSlug( state );
		const site = getSiteBySlug( state, selectedSiteSlug );
		return {
			siteId: site.ID,
			selectedSiteSlug,
			isFreePlan: ! isCurrentPlanPaid( state, site.ID ),
			hasWordAds: hasFeature( state, site.ID, FEATURE_WORDADS_INSTANT ),
			hasSimplePayments: hasFeature( state, site.ID, FEATURE_SIMPLE_PAYMENTS ),
			hasConnectedAccount: !! get(
				state,
				[ 'memberships', 'settings', site.ID, 'connectedAccountId' ],
				false
			),
			hasSetupAds: site.options.wordads || isRequestingWordAdsApprovalForSite( state, site ),
		};
	},
	dispatch => ( {
		trackUpgrade: ( plan: string, feature: string ) =>
			dispatch(
				composeAnalytics(
					recordTracksEvent( 'calypso_earn_upgrade', { plan, feature } ),
					bumpStat( 'calypso_earn_upgrade', feature )
				)
			),
		trackLink: ( feature: string ) =>
			dispatch(
				composeAnalytics(
					recordTracksEvent( 'calypso_earn_link', { feature } ),
					bumpStat( 'calypso_earn_link', feature )
				)
			),
	} )
)( Home );
