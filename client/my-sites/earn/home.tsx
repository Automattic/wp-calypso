import {
	FEATURE_WORDADS_INSTANT,
	FEATURE_SIMPLE_PAYMENTS,
	PLAN_PREMIUM,
	PLAN_JETPACK_SECURITY_DAILY,
	FEATURE_PREMIUM_CONTENT_CONTAINER,
	FEATURE_DONATIONS,
	FEATURE_RECURRING_PAYMENTS,
	WPCOM_FEATURES_WORDADS,
} from '@automattic/calypso-products';
import { localizeUrl } from '@automattic/i18n-utils';
import { addQueryArgs } from '@wordpress/url';
import { useTranslate } from 'i18n-calypso';
import { compact } from 'lodash';
import page from 'page';
import { FunctionComponent, Fragment, useState, useEffect } from 'react';
import { connect } from 'react-redux';
import earnSectionImage from 'calypso/assets/images/earn/earn-section.svg';
import ClipboardButtonInput from 'calypso/components/clipboard-button-input';
import QueryMembershipsSettings from 'calypso/components/data/query-memberships-settings';
import QueryWordadsStatus from 'calypso/components/data/query-wordads-status';
import EmptyContent from 'calypso/components/empty-content';
import PromoSection, { Props as PromoSectionProps } from 'calypso/components/promo-section';
import { CtaButton } from 'calypso/components/promo-section/promo-card/cta';
import wp from 'calypso/lib/wp';
import { isEligibleForProPlan } from 'calypso/my-sites/plans-comparison';
import { bumpStat, composeAnalytics, recordTracksEvent } from 'calypso/state/analytics/actions';
import { canCurrentUser } from 'calypso/state/selectors/can-current-user';
import isSiteAutomatedTransfer from 'calypso/state/selectors/is-site-automated-transfer';
import siteHasFeature from 'calypso/state/selectors/site-has-feature';
import { getSitePlanSlug } from 'calypso/state/sites/plans/selectors';
import { isCurrentPlanPaid, isJetpackSite } from 'calypso/state/sites/selectors';
import getSiteBySlug from 'calypso/state/sites/selectors/get-site-by-slug';
import { getSelectedSiteSlug, getSelectedSiteId } from 'calypso/state/ui/selectors';
import { isRequestingWordAdsApprovalForSite } from 'calypso/state/wordads/approve/selectors';
import type { Image } from 'calypso/components/promo-section/promo-card/index';
import type { AppState, SiteSlug } from 'calypso/types';

import './style.scss';

interface ConnectedProps {
	siteId: number;
	selectedSiteSlug: SiteSlug | null;
	isNonAtomicJetpack: boolean;
	isLoading: boolean;
	hasSimplePayments: boolean;
	hasWordAds: boolean;
	hasConnectedAccount: boolean | null;
	hasSetupAds: boolean;
	trackUpgrade: ( plan: string, feature: string ) => void;
	trackLearnLink: ( feature: string ) => void;
	trackCtaButton: ( feature: string ) => void;
	isUserAdmin?: boolean;
	eligibleForProPlan?: boolean;
	hasDonations: boolean;
	hasPremiumContent: boolean;
	hasRecurringPayments: boolean;
}

const Home: FunctionComponent< ConnectedProps > = ( {
	siteId,
	selectedSiteSlug,
	isNonAtomicJetpack,
	isUserAdmin,
	isLoading,
	hasSimplePayments,
	hasWordAds,
	hasConnectedAccount,
	hasSetupAds,
	eligibleForProPlan,
	hasDonations,
	hasPremiumContent,
	hasRecurringPayments,
	trackUpgrade,
	trackLearnLink,
	trackCtaButton,
} ) => {
	const translate = useTranslate();
	const [ peerReferralLink, setPeerReferralLink ] = useState( '' );

	useEffect( () => {
		if ( peerReferralLink ) {
			return;
		}
		wp.req.get( '/me/peer-referral-link', ( error: string, data: string ) => {
			setPeerReferralLink( ! error && data ? data : '' );
		} );
	}, [ peerReferralLink ] );

	const onPeerReferralCtaClick = () => {
		if ( peerReferralLink ) {
			return;
		}
		wp.req.post(
			'/me/peer-referral-link-enable',
			{ enable: true },
			( error: string, data: string ) => {
				setPeerReferralLink( ! error && data ? data : '' );
			}
		);
	};

	const getAnyPlanNames = () => {
		const jetpackText = translate( 'Available with Jetpack Security and Jetpack Complete.' );

		// Space isn't included in the translatable string to prevent it being easily missed.
		return isNonAtomicJetpack
			? ' ' + jetpackText
			: ' ' + translate( 'Available with any paid plan — no plugin required.' );
	};

	const getPremiumPlanNames = () => {
		const nonAtomicJetpackText = eligibleForProPlan
			? translate( 'Available only with a Pro plan.' )
			: translate( 'Available only with a Premium, Business, or eCommerce plan.' );

		// Space isn't included in the translatable string to prevent it being easily missed.
		return isNonAtomicJetpack ? getAnyPlanNames() : ' ' + nonAtomicJetpackText;
	};

	/**
	 * Return the content to display in the Simple Payments card based on the current plan.
	 *
	 * @returns {Object} Object with props to render a PromoCard.
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
	 * @returns {Object} Object with props to render a PromoCard.
	 */
	const getRecurringPaymentsCard = () => {
		const hasConnectionCtaTitle = translate( 'Manage Payment Button' );
		const noConnectionCtaTitle = translate( 'Enable Payment Button' );
		const ctaTitle = hasConnectedAccount ? hasConnectionCtaTitle : noConnectionCtaTitle;
		const cta = ! hasRecurringPayments
			? {
					text: translate( 'Unlock this feature' ),
					action: () => {
						trackUpgrade( 'any-paid-plan', 'recurring-payments' );
						page( `/plans/${ selectedSiteSlug }` );
					},
			  }
			: {
					text: ctaTitle,
					action: () => {
						trackCtaButton( 'recurring-payments' );
						page( `/earn/payments/${ selectedSiteSlug }` );
					},
			  };
		const title = translate( 'Collect payments' );

		const body = (
			<>
				{ hasConnectedAccount
					? translate(
							'Let visitors pay for digital goods and services or make quick, pre-set donations by inserting the Payment Button block.'
					  )
					: translate(
							'Let visitors pay for digital goods and services or make quick, pre-set donations by enabling the Payment Button block.'
					  ) }
				<>
					<br />
					<em>{ getAnyPlanNames() }</em>
				</>
			</>
		);

		const learnMoreLink = ! hasConnectedAccount
			? {
					url: 'https://wordpress.com/payments-donations/',
					onClick: () => trackLearnLink( 'recurring-payments' ),
			  }
			: {
					url: 'https://wordpress.com/support/wordpress-editor/blocks/payments/#payment-button-block',
					onClick: () => trackLearnLink( 'recurring-payments' ),
					label: translate( 'Support documentation' ),
			  };
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
	 * @returns {Object} Object with props to render a PromoCard.
	 */
	const getDonationsCard = () => {
		const hasConnectionCtaTitle = translate( 'Manage Donations Form' );
		const noConnectionCtaTitle = translate( 'Enable Donations Form' );
		const ctaTitle = hasConnectedAccount ? hasConnectionCtaTitle : noConnectionCtaTitle;
		const cta = ! hasDonations
			? {
					text: translate( 'Unlock this feature' ),
					action: () => {
						trackUpgrade( 'any-paid-plan', 'donations' );
						page( `/plans/${ selectedSiteSlug }` );
					},
			  }
			: {
					text: ctaTitle,
					action: () => {
						trackCtaButton( 'donations' );
						page( `/earn/payments/${ selectedSiteSlug }` );
					},
			  };
		const title = translate( 'Accept donations and tips' );

		const body = (
			<>
				{ hasConnectedAccount
					? translate(
							'Accept one-time and recurring donations by inserting the Donations Form block.'
					  )
					: translate(
							'Accept one-time and recurring donations by enabling the Donations Form block.'
					  ) }
				<>
					<br />
					<em>{ getAnyPlanNames() }</em>
				</>
			</>
		);

		const learnMoreLink = ! hasConnectedAccount
			? {
					url: localizeUrl( 'https://wordpress.com/payments-donations/' ),
					onClick: () => trackLearnLink( 'donations' ),
			  }
			: {
					url: localizeUrl( 'https://wordpress.com/support/wordpress-editor/blocks/donations/' ),
					onClick: () => trackLearnLink( 'donations' ),
					label: translate( 'Support documentation' ),
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
	 * @returns {Object | undefined} Object with props to render a PromoCard.
	 */
	const getPremiumContentCard = () => {
		const hasConnectionCtaTitle = translate( 'Manage Premium Content' );
		const noConnectionCtaTitle = translate( 'Enable Premium Content' );
		const ctaTitle = hasConnectedAccount ? hasConnectionCtaTitle : noConnectionCtaTitle;
		if ( isNonAtomicJetpack ) {
			return;
		}
		const cta = ! hasPremiumContent
			? {
					text: translate( 'Unlock this feature' ),
					action: () => {
						trackUpgrade( 'any-paid-plan', 'premium-content' );
						page( `/plans/${ selectedSiteSlug }` );
					},
			  }
			: {
					text: ctaTitle,
					action: () => {
						trackCtaButton( 'premium-content' );
						page( `/earn/payments/${ selectedSiteSlug }` );
					},
			  };
		const title = translate( 'Profit from subscriber-only content' );
		const hasConnectionBodyText = translate(
			'Create paid subscriptions so only subscribers can see selected content on your site — everyone else will see a paywall.'
		);
		const noConnectionBodyText = translate(
			'Create paid subscription options to share premium content like text, images, video, and any other content on your website.'
		);
		const bodyText = hasConnectedAccount ? hasConnectionBodyText : noConnectionBodyText;

		const body = (
			<>
				{ bodyText }
				<>
					<br />
					<em>{ getAnyPlanNames() }</em>
				</>
			</>
		);
		const learnMoreLink = {
			url: 'https://wordpress.com/support/wordpress-editor/blocks/premium-content-block/',
			onClick: () => trackLearnLink( 'premium-content' ),
			label: hasConnectedAccount ? translate( 'Support documentation' ) : null,
		};

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
	 * @returns {Object | undefined} Object with props to render a PromoCard.
	 */
	const getPaidNewsletterCard = () => {
		if ( isNonAtomicJetpack ) {
			return;
		}
		const cta = ! hasPremiumContent
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
		const body = ! hasPremiumContent ? (
			<>
				{ ' ' }
				{ translate(
					'Share premium content with paying subscribers automatically through email.'
				) }
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
	 * @returns {Object | undefined} Object with props to render a PromoCard.
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
	 * @returns {Object} Object with props to render a PromoCard.
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
				{ ! hasWordAds && <em>{ getPremiumPlanNames() }</em> }
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
			align: 'right' as Image[ 'align' ],
		},
		body: translate(
			'Accept credit card payments today for just about anything – physical and digital goods, services, donations and tips, or access to your exclusive content. {{a}}Watch our tutorial videos to get started{{/a}}.',
			{
				components: {
					a: (
						<a
							href="https://wordpress.com/support/video-tutorials-add-payments-features-to-your-site-with-our-guides/"
							target="_blank"
							rel="noopener noreferrer"
						/>
					),
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
			<QueryMembershipsSettings siteId={ siteId } />
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

export default connect(
	( state: AppState ) => {
		// Default value of 0 to appease TypeScript for selectors that don't allow a null site ID value.
		const siteId = getSelectedSiteId( state ) ?? 0;
		const selectedSiteSlug = getSelectedSiteSlug( state );
		const site = getSiteBySlug( state, selectedSiteSlug );

		const hasConnectedAccount =
			state?.memberships?.settings?.[ siteId ]?.connectedAccountId ?? null;
		const sitePlanSlug = getSitePlanSlug( state, siteId );
		const hasPaidPlan = isCurrentPlanPaid( state, siteId );
		const isLoading = ( hasConnectedAccount === null && hasPaidPlan ) || sitePlanSlug === null;

		return {
			siteId,
			selectedSiteSlug,
			isNonAtomicJetpack: Boolean(
				isJetpackSite( state, siteId ) && ! isSiteAutomatedTransfer( state, siteId )
			),
			isUserAdmin: canCurrentUser( state, siteId, 'manage_options' ),
			hasWordAds: siteHasFeature( state, siteId, WPCOM_FEATURES_WORDADS ),
			hasSimplePayments: siteHasFeature( state, siteId, FEATURE_SIMPLE_PAYMENTS ),
			hasConnectedAccount,
			eligibleForProPlan: isEligibleForProPlan( state, siteId ),
			isLoading,
			hasSetupAds: Boolean(
				site?.options?.wordads || isRequestingWordAdsApprovalForSite( state, site )
			),
			hasDonations: hasConnectedAccount || siteHasFeature( state, siteId, FEATURE_DONATIONS ),
			hasPremiumContent:
				hasConnectedAccount || siteHasFeature( state, siteId, FEATURE_PREMIUM_CONTENT_CONTAINER ),
			hasRecurringPayments:
				hasConnectedAccount || siteHasFeature( state, siteId, FEATURE_RECURRING_PAYMENTS ),
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
