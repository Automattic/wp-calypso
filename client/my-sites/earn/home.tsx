/**
 * External dependencies
 */
import { connect } from 'react-redux';
import React, { FunctionComponent, Fragment, useState, useEffect } from 'react';
import page from 'page';
import { compact, overSome } from 'lodash';

/**
 * Internal dependencies
 */

import wp from 'calypso/lib/wp';
import { useTranslate } from 'i18n-calypso';
import { SiteSlug } from 'calypso/types';
import { getSelectedSiteSlug, getSelectedSiteId } from 'calypso/state/ui/selectors';
import getSiteBySlug from 'calypso/state/sites/selectors/get-site-by-slug';
import { hasFeature, getSitePlanSlug } from 'calypso/state/sites/plans/selectors';
import { isCurrentPlanPaid, isJetpackSite } from 'calypso/state/sites/selectors';
import canCurrentUser from 'calypso/state/selectors/can-current-user';
import isSiteAutomatedTransfer from 'calypso/state/selectors/is-site-automated-transfer';
import { isRequestingWordAdsApprovalForSite } from 'calypso/state/wordads/approve/selectors';
import EmptyContent from 'calypso/components/empty-content';
import PromoSection, { Props as PromoSectionProps } from 'calypso/components/promo-section';
import QueryMembershipsSettings from 'calypso/components/data/query-memberships-settings';
import QueryWordadsStatus from 'calypso/components/data/query-wordads-status';
import {
	FEATURE_WORDADS_INSTANT,
	FEATURE_SIMPLE_PAYMENTS,
	PLAN_PREMIUM,
	PLAN_JETPACK_SECURITY_DAILY,
} from 'calypso/lib/plans/constants';
import { bumpStat, composeAnalytics, recordTracksEvent } from 'calypso/state/analytics/actions';
import ClipboardButtonInput from 'calypso/components/clipboard-button-input';
import { CtaButton } from 'calypso/components/promo-section/promo-card/cta';
import { localizeUrl } from 'calypso/lib/i18n-utils';
import { addQueryArgs } from '@wordpress/url';
import {
	isPremiumPlan,
	isBusinessPlan,
	isEcommercePlan,
	isJetpackPremiumPlan,
	isJetpackBusinessPlan,
	isSecurityDailyPlan,
	isSecurityRealTimePlan,
	isCompletePlan,
} from 'calypso/lib/plans';

/**
 * Image dependencies
 */
import earnSectionImage from 'calypso/assets/images/earn/earn-section.svg';

/**
 * Style dependencies
 */
import './style.scss';

interface ConnectedProps {
	siteId: number;
	selectedSiteSlug: SiteSlug;
	isFreePlan: boolean;
	isNonAtomicJetpack: boolean;
	isLoading: boolean;
	hasSimplePayments: boolean;
	hasWordAds: boolean;
	hasConnectedAccount: boolean | null;
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
	isPremiumOrBetterPlan,
	isNonAtomicJetpack,
	isUserAdmin,
	isLoading,
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

	const getAnyPlanNames = () => {
		const jetpackText = translate( 'Available with Jetpack Security and Jetpack Complete.' );

		// Space isn't included in the translatable string to prevent it being easily missed.
		return isNonAtomicJetpack
			? ' ' + jetpackText
			: ' ' + translate( 'Available with any paid plan.' );
	};

	const getPremiumPlanNames = () => {
		// Space isn't included in the translatable string to prevent it being easily missed.
		return isNonAtomicJetpack
			? getAnyPlanNames()
			: ' ' + translate( 'Available only with a Premium, Business, or eCommerce plan.' );
	};

	/**
	 * Return the content to display in the Simple Payments card based on the current plan.
	 *
	 * @returns {object} Object with props to render a PromoCard.
	 */
	const getSimplePaymentsCard = () => {
		const supportLink = localizeUrl(
			'https://wordpress.com/support/wordpress-editor/blocks/pay-with-paypal/'
		);
		const cta = hasSimplePayments
			? {
					text: translate( 'Learn how to get started' ),
					action: { url: supportLink, onClick: () => trackCtaButton( 'simple-payments' ) },
			  }
			: {
					text: translate( 'Unlock this feature' ),
					action: () => {
						trackUpgrade( 'plans', 'simple-payments' );
						page(
							addQueryArgs( `/plans/${ selectedSiteSlug }`, {
								feature: FEATURE_SIMPLE_PAYMENTS,
								plan: isNonAtomicJetpack ? PLAN_JETPACK_SECURITY_DAILY : PLAN_PREMIUM,
							} )
						);
					},
			  };
		const learnMoreLink = hasSimplePayments
			? null
			: { url: supportLink, onClick: () => trackLearnLink( 'simple-payments' ) };
		const title = translate( 'Collect PayPal payments' );
		const body = (
			<>
				{ translate(
					'Accept credit card payments via PayPal for physical products, services, donations, or support of your creative work.'
				) }
				{ ! hasSimplePayments && <em>{ getPremiumPlanNames() }</em> }
			</>
		);

		return {
			title,
			body,
			icon: 'credit-card',
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
					text: translate( 'Unlock this feature' ),
					action: () => {
						trackUpgrade( 'any-paid-plan', 'recurring-payments' );
						page( `/plans/${ selectedSiteSlug }` );
					},
			  }
			: {
					text: translate( 'Collect payments' ),
					action: () => {
						trackCtaButton( 'recurring-payments' );
						page( `/earn/payments/${ selectedSiteSlug }` );
					},
			  };
		const hasConnectionTitle = translate( 'Manage payments' );
		const noConnectionTitle = translate( 'Collect payments' );
		const title = hasConnectedAccount ? hasConnectionTitle : noConnectionTitle;

		const hasConnectionBody = translate(
			"Manage your customers and subscribers, or your current subscription options and review the total revenue that you've made from payments."
		);
		const noConnectionBody = (
			<>
				{ translate(
					'Accept one-time and recurring credit card payments for physical products, services, memberships, subscriptions, and donations.'
				) }
				{ isFreePlan && <em>{ getAnyPlanNames() }</em> }
			</>
		);
		const body = hasConnectedAccount ? hasConnectionBody : noConnectionBody;

		const learnMoreLink = isFreePlan
			? {
					url: 'https://wordpress.com/support/recurring-payments/',
					onClick: () => trackLearnLink( 'recurring-payments' ),
			  }
			: null;
		return {
			title,
			body,
			icon: 'money',
			actions: {
				cta,
				learnMoreLink,
			},
		};
	};

	/**
	 * Return the content to display in the Donations card based on the current plan.
	 *
	 * @returns {object} Object with props to render a PromoCard.
	 */
	const getDonationsCard = () => {
		const cta = isFreePlan
			? {
					text: translate( 'Unlock this feature' ),
					action: () => {
						trackUpgrade( 'any-paid-plan', 'donations' );
						page( `/plans/${ selectedSiteSlug }` );
					},
			  }
			: {
					text: translate( 'Manage donations' ),
					action: () => {
						trackCtaButton( 'donations' );
						page( `/earn/payments/${ selectedSiteSlug }` );
					},
			  };
		const title = translate( 'Accept donations and tips' );

		const body = (
			<>
				{ translate(
					'Collect donations, tips, and contributions for your creative pursuits, organization, or whatever your website is about.'
				) }
				{ isFreePlan && <em>{ getAnyPlanNames() }</em> }
			</>
		);

		const learnMoreLink = {
			url: localizeUrl( 'https://wordpress.com/support/donations/' ),
			onClick: () => trackLearnLink( 'donations' ),
		};

		return {
			title,
			body,
			icon: 'heart-outline',
			actions: {
				cta,
				learnMoreLink,
			},
		};
	};

	/**
	 * Return the content to display in the Premium Content Block card based on the current plan.
	 *
	 * @returns {object} Object with props to render a PromoCard.
	 */
	const getPremiumContentCard = () => {
		const cta = isFreePlan
			? {
					text: translate( 'Unlock this feature' ),
					action: () => {
						trackUpgrade( 'any-paid-plan', 'premium-content' );
						page( `/plans/${ selectedSiteSlug }` );
					},
			  }
			: {
					text: translate( 'Add premium content subscriptions' ),
					action: () => {
						trackCtaButton( 'premium-content' );
						page( `/earn/payments/${ selectedSiteSlug }` );
					},
			  };
		const title = hasConnectedAccount
			? translate( 'Manage your premium content' )
			: translate( 'Collect payments for content' );
		const body = hasConnectedAccount ? (
			translate(
				'Create paid subscription options to share premium content like text, images, video, and any other content on your website. Browse our {{a}}docs{{/a}} for the details.',
				{
					components: {
						a: (
							<a
								href="https://wordpress.com/support/wordpress-editor/blocks/premium-content-block/"
								target="_blank"
								rel="noopener noreferrer"
							/>
						),
					},
				}
			)
		) : (
			<>
				{ translate(
					'Create paid subscription options to share premium content like text, images, video, and any other content on your website.'
				) }
				{ isFreePlan && <em>{ getAnyPlanNames() }</em> }
			</>
		);
		const learnMoreLink = isFreePlan
			? {
					url: 'https://wordpress.com/support/wordpress-editor/blocks/premium-content-block/',
					onClick: () => trackLearnLink( 'premium-content' ),
			  }
			: null;
		return {
			title,
			body,
			icon: 'bookmark-outline',
			actions: {
				cta,
				learnMoreLink,
			},
		};
	};

	/**
	 * Return the content to display in the Paid Newsletter card based on the current plan.
	 *
	 * @returns {object} Object with props to render a PromoCard.
	 */
	const getPaidNewsletterCard = () => {
		const cta = isFreePlan
			? {
					text: translate( 'Unlock this feature' ),
					action: () => {
						trackUpgrade( 'any-paid-plan', 'paid-newsletters' );
						page( `/plans/${ selectedSiteSlug }` );
					},
			  }
			: {
					text: translate( 'Learn how to get started' ),
					action: () => {
						trackCtaButton( 'learn-paid-newsletters' );
						if ( window && window.location ) {
							window.location.href = localizeUrl(
								'https://wordpress.com/support/paid-newsletters/'
							);
						}
					},
			  };
		const title = translate( 'Send paid email newsletters' );
		const body = isFreePlan ? (
			<>
				{ ' ' }
				{ translate(
					'Share premium content with paying subscribers automatically through email.'
				) }
				{ <em>{ getAnyPlanNames() }</em> }
			</>
		) : (
			translate( 'Share premium content with paying subscribers automatically through email.' )
		);

		return {
			title,
			body,
			icon: 'mail',
			actions: {
				cta,
			},
		};
	};

	/**
	 * Return the content to display in the Peer Referrals card.
	 *
	 * @returns {object} Object with props to render a PromoCard.
	 */
	const getPeerReferralsCard = () => {
		if ( isNonAtomicJetpack ) {
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
			cta.component = <ClipboardButtonInput value={ localizeUrl( peerReferralLink ) } />;
		}

		return {
			title: translate( 'Refer a friend, you’ll both earn credits' ),
			body: peerReferralLink
				? translate(
						'To earn free credits, share the link below with your friends, family, and website visitors.'
				  )
				: translate(
						'Share WordPress.com with friends, family, and website visitors. For every paying customer you send our way, you’ll both earn US$25 in free credits. By clicking “Earn free credits”, you agree to {{a}}these terms{{/a}}.',
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
				  ),
			icon: 'user-add',
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
						text: translate( 'Unlock this feature' ),
						action: () => {
							trackUpgrade( 'plans', 'ads' );
							page(
								`/plans/${ selectedSiteSlug }?feature=${ FEATURE_WORDADS_INSTANT }&plan=${ PLAN_PREMIUM }`
							);
						},
				  };
		const title = hasSetupAds ? translate( 'View ad dashboard' ) : translate( 'Earn ad revenue' );
		const body = hasSetupAds ? (
			translate(
				"Check out your ad earnings history, including total earnings, total paid to date, and the amount that you've still yet to be paid."
			)
		) : (
			<>
				{ translate(
					'Make money each time someone visits your site by displaying advertisements on all your posts and pages.'
				) }
				{ ! isPremiumOrBetterPlan && <em>{ getPremiumPlanNames() }</em> }
			</>
		);

		const learnMoreLink = ! ( hasWordAds || hasSetupAds )
			? { url: 'https://wordads.co/', onClick: () => trackLearnLink( 'ads' ) }
			: null;
		return {
			title,
			body,
			icon: 'speaker',
			actions: {
				cta,
				learnMoreLink,
			},
		};
	};

	const getHeaderCard = () => ( {
		title: translate( 'Start earning money now' ),
		image: {
			path: earnSectionImage,
			align: 'right',
		},
		body: translate(
			'Accept credit card payments today for just about anything – physical and digital goods, services, donations and tips, or access to your exclusive content. {{a}}{{b}}Watch our tutorial videos to get started{{/b}}{{/a}}.',
			{
				components: {
					a: (
						<a
							href="https://wordpress.com/support/video-tutorials-add-payments-features-to-your-site-with-our-guides/"
							target="_blank"
							rel="noopener noreferrer"
						/>
					),
					b: <strong />,
				},
			}
		),
	} );

	const getPlaceholderPromoCard = () => {
		return { title: '', body: '', image: <div /> };
	};

	const promos: PromoSectionProps = {
		header: getHeaderCard(),
		promos: compact( [
			getRecurringPaymentsCard(),
			getDonationsCard(),
			getPremiumContentCard(),
			getPaidNewsletterCard(),
			getSimplePaymentsCard(),
			getAdsCard(),
			getPeerReferralsCard(),
		] ),
	};

	if ( ! isUserAdmin ) {
		return (
			<EmptyContent
				illustration="/calypso/images/illustrations/illustration-404.svg"
				title={ translate( 'You are not authorized to view this page' ) }
			/>
		);
	}

	return (
		<Fragment>
			{ ! hasWordAds && <QueryWordadsStatus siteId={ siteId } /> }
			{ ! isFreePlan && <QueryMembershipsSettings siteId={ siteId } /> }
			{ isLoading && (
				<div className="earn__placeholder-promo-card">
					<PromoSection
						header={ getHeaderCard() }
						promos={ [ getPlaceholderPromoCard(), getPlaceholderPromoCard() ] }
					/>
				</div>
			) }
			{ ! isLoading && <PromoSection { ...promos } /> }
		</Fragment>
	);
};

export default connect< ConnectedProps, {}, {} >(
	( state ) => {
		// Default value of 0 to appease TypeScript for selectors that don't allow a null site ID value.
		const siteId = getSelectedSiteId( state ) ?? 0;
		const selectedSiteSlug = getSelectedSiteSlug( state );
		const site = getSiteBySlug( state, selectedSiteSlug );
		const isFreePlan = ! isCurrentPlanPaid( state, siteId );

		const hasConnectedAccount =
			state?.memberships?.settings?.[ siteId ]?.connectedAccountId ?? null;
		const sitePlanSlug = getSitePlanSlug( state, siteId );
		const isLoading = ( hasConnectedAccount === null && ! isFreePlan ) || sitePlanSlug === null;
		const isPremiumOrBetterPlan =
			sitePlanSlug &&
			overSome(
				isPremiumPlan,
				isBusinessPlan,
				isEcommercePlan,
				isJetpackPremiumPlan,
				isJetpackBusinessPlan,
				isSecurityDailyPlan,
				isSecurityRealTimePlan,
				isCompletePlan
			)( sitePlanSlug );
		return {
			siteId,
			selectedSiteSlug,
			isFreePlan,
			isPremiumOrBetterPlan,
			isNonAtomicJetpack:
				isJetpackSite( state, siteId ) && ! isSiteAutomatedTransfer( state, siteId ),
			isUserAdmin: canCurrentUser( state, siteId, 'manage_options' ),
			hasWordAds: hasFeature( state, siteId, FEATURE_WORDADS_INSTANT ),
			hasSimplePayments: hasFeature( state, siteId, FEATURE_SIMPLE_PAYMENTS ),
			hasConnectedAccount,
			isLoading,
			hasSetupAds: site.options.wordads || isRequestingWordAdsApprovalForSite( state, site ),
		};
	},
	( dispatch ) => ( {
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
