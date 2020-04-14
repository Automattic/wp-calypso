/**
 * External dependencies
 */
import { connect } from 'react-redux';
import React, { FunctionComponent, Fragment, useState, useEffect } from 'react';
import page from 'page';
import { get, compact } from 'lodash';

/**
 * Internal dependencies
 */
import wp from 'lib/wp';
import { useTranslate } from 'i18n-calypso';
import { SiteSlug } from 'types';
import { getSelectedSiteSlug } from 'state/ui/selectors';
import getSiteBySlug from 'state/sites/selectors/get-site-by-slug';
import { hasFeature } from 'state/sites/plans/selectors';
import { isCurrentPlanPaid, isJetpackSite } from 'state/sites/selectors';
import isSiteAutomatedTransfer from 'state/selectors/is-site-automated-transfer';
import { isRequestingWordAdsApprovalForSite } from 'state/wordads/approve/selectors';
import PromoSection, { Props as PromoSectionProps } from 'components/promo-section';
import QueryMembershipsSettings from 'components/data/query-memberships-settings';
import QueryWordadsStatus from 'components/data/query-wordads-status';
import { FEATURE_WORDADS_INSTANT, FEATURE_SIMPLE_PAYMENTS } from 'lib/plans/constants';
import { bumpStat, composeAnalytics, recordTracksEvent } from 'state/analytics/actions';
import ClipboardButtonInput from 'components/clipboard-button-input';
import { CtaButton } from 'components/promo-section/promo-card/cta';

/**
 * Image dependencies
 */
import earnSectionImage from 'assets/images/earn/earn-section.svg';
import adsImage from 'assets/images/earn/ads.svg';
import recurringImage from 'assets/images/earn/recurring.svg';
import referralImage from 'assets/images/earn/referral.svg';
import simplePaymentsImage from 'assets/images/earn/simple-payments.svg';

interface ConnectedProps {
	siteId: number;
	selectedSiteSlug: SiteSlug;
	isFreePlan: boolean;
	isJetpack: boolean;
	isAtomicSite: boolean;
	hasSimplePayments: boolean;
	hasWordAds: boolean;
	hasConnectedAccount: boolean;
	hasSetupAds: boolean;
	trackUpgrade: ( plan: string, feature: string ) => void;
	trackLearnLink: ( feature: string ) => void;
	trackCtaButton: ( feature: string ) => void;
}

const wpcom = wp.undocumented();

const Home: FunctionComponent< ConnectedProps > = ( {
	siteId,
	selectedSiteSlug,
	isFreePlan,
	isJetpack,
	isAtomicSite,
	hasSimplePayments,
	hasWordAds,
	hasConnectedAccount,
	hasSetupAds,
	trackUpgrade,
	trackLearnLink,
	trackCtaButton,
} ) => {
	const translate = useTranslate();
	const [ peerReferralLink, setPeerReferralLink ] = useState( '' );

	useEffect( () => {
		if ( peerReferralLink ) return;
		wpcom.me().getPeerReferralLink( ( error: string, data: string ) => {
			setPeerReferralLink( ! error && data ? data : '' );
		} );
	}, [ peerReferralLink ] );

	const onPeerReferralCtaClick = () => {
		if ( peerReferralLink ) return;
		wpcom.me().setPeerReferralLinkEnable( true, ( error: string, data: string ) => {
			setPeerReferralLink( ! error && data ? data : '' );
		} );
	};

	/**
	 * Return the content to display in the Simple Payments card based on the current plan.
	 *
	 * @returns {object} Object with props to render a PromoCard.
	 */
	const getSimplePaymentsCard = () => {
		const supportLink =
			'https://wordpress.com/support/wordpress-editor/blocks/simple-payments-block/';
		const cta = hasSimplePayments
			? {
					text: translate( 'Collect one-time payments' ),
					action: { url: supportLink, onClick: () => trackCtaButton( 'simple-payments' ) },
			  }
			: {
					text: translate( 'Upgrade to Premium' ),
					action: () => {
						trackUpgrade( 'premium', 'simple-payments' );
						page( `/checkout/${ selectedSiteSlug }/premium/` );
					},
			  };
		const learnMoreLink = hasSimplePayments
			? null
			: { url: supportLink, onClick: () => trackLearnLink( 'simple-payments' ) };
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
				path: simplePaymentsImage,
			},
			actions: {
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
					text: translate( 'Upgrade' ),
					action: () => {
						trackUpgrade( 'any-paid-plan', 'recurring-payments' );
						page( `/plans/${ selectedSiteSlug }` );
					},
			  }
			: {
					text: translate( 'Collect recurring payments' ),
					action: () => {
						trackCtaButton( 'recurring-payments' );
						page( `/earn/payments/${ selectedSiteSlug }` );
					},
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
					url: 'https://wordpress.com/support/recurring-payments/',
					onClick: () => trackLearnLink( 'recurring-payments' ),
			  }
			: null;
		return {
			title,
			body,
			badge: translate( 'New' ),
			image: {
				path: recurringImage,
			},
			actions: {
				cta,
				learnMoreLink,
			},
		};
	};

	/**
	 * Return the content to display in the Peer Referrals card.
	 *
	 * @returns {object} Object with props to render a PromoCard.
	 */
	const getPeerReferralsCard = () => {
		const isJetpackNotAtomic = isJetpack && ! isAtomicSite;

		if ( isJetpackNotAtomic ) {
			return;
		}

		const cta: CtaButton = {
			text: translate( 'Earn free credits' ) as string,
			action: () => {
				trackCtaButton( 'peer-referral-wpcom' );
				onPeerReferralCtaClick();
			},
		};

		if ( peerReferralLink ) {
			cta.component = <ClipboardButtonInput value={ peerReferralLink } />;
		}

		return {
			title: translate( 'Refer a friend, you’ll both earn credits' ),
			body: peerReferralLink
				? translate(
						'To earn free credits, share the link below with your friends, family, and website visitors. ' +
							'By doing so you agree to the WordPress.com Peer Referral Program {{a}}Terms and Conditions.{{/a}}',
						{
							components: {
								a: (
									<a
										href="https://wordpress.com/refer-a-friend-program-terms-of-service/"
										target="_blank"
										rel="noopener noreferrer"
									/>
								),
							},
						}
				  )
				: translate(
						'Share WordPress.com with friends, family, and website visitors. For every paying customer you send our way, you’ll both earn US$25 in free credits. {{em}}Available with every plan{{/em}}.',
						{
							components: {
								em: <em />,
							},
						}
				  ),
			image: {
				path: referralImage,
			},
			actions: {
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
		const cta =
			hasWordAds || hasSetupAds
				? {
						text: hasSetupAds ? translate( 'View ad dashboard' ) : translate( 'Earn ad revenue' ),
						action: () => {
							trackCtaButton( 'ads' );
							page(
								`/earn/${ hasSetupAds ? 'ads-earnings' : 'ads-settings' }/${ selectedSiteSlug }`
							);
						},
				  }
				: {
						text: translate( 'Upgrade to Premium' ),
						action: () => {
							trackUpgrade( 'premium', 'ads' );
							page( `/checkout/${ selectedSiteSlug }/premium/` );
						},
				  };
		const title = hasSetupAds ? translate( 'View ad dashboard' ) : translate( 'Earn ad revenue' );
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
		const learnMoreLink = ! ( hasWordAds || hasSetupAds )
			? { url: 'https://wordads.co/', onClick: () => trackLearnLink( 'ads' ) }
			: null;
		return {
			title,
			body,
			image: {
				path: adsImage,
			},
			actions: {
				cta,
				learnMoreLink,
			},
		};
	};

	const promos: PromoSectionProps = {
		header: {
			title: translate( 'Start earning money now' ),
			image: {
				path: earnSectionImage,
			},
			body: translate( 'There is a range of ways to earn money through your WordPress site.' ),
		},
		promos: compact( [
			getSimplePaymentsCard(),
			getRecurringPaymentsCard(),
			getAdsCard(),
			getPeerReferralsCard(),
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
			isJetpack: isJetpackSite( state, site.ID ),
			isAtomicSite: isSiteAutomatedTransfer( state, site.ID ),
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
					recordTracksEvent( 'calypso_earn_page_upgrade_button_click', { plan, feature } ),
					bumpStat( 'calypso_earn_page', 'upgrade-button-' + feature )
				)
			),
		trackLearnLink: ( feature: string ) =>
			dispatch(
				composeAnalytics(
					recordTracksEvent( 'calypso_earn_page_learn_link_click', { feature } ),
					bumpStat( 'calypso_earn_page', 'learn-link-' + feature )
				)
			),
		trackCtaButton: ( feature: string ) =>
			dispatch(
				composeAnalytics(
					recordTracksEvent( 'calypso_earn_page_cta_button_click', { feature } ),
					bumpStat( 'calypso_earn_page', 'cta-button-' + feature )
				)
			),
	} )
)( Home );
