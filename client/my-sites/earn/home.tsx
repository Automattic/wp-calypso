import {
	FEATURE_SIMPLE_PAYMENTS,
	FEATURE_WORDADS_INSTANT,
	PLAN_JETPACK_SECURITY_DAILY,
	PLAN_PREMIUM,
} from '@automattic/calypso-products';
import { localizeUrl } from '@automattic/i18n-utils';
import { addQueryArgs } from '@wordpress/url';
import { useTranslate } from 'i18n-calypso';
import { compact } from 'lodash';
import page from 'page';
import { useState, useEffect } from 'react';
import ClipboardButtonInput from 'calypso/components/clipboard-button-input';
import QueryMembershipProducts from 'calypso/components/data/query-memberships';
import QueryMembershipsEarnings from 'calypso/components/data/query-memberships-earnings';
import QueryMembershipsSettings from 'calypso/components/data/query-memberships-settings';
import EmptyContent from 'calypso/components/empty-content';
import PromoSection, {
	Props as PromoSectionProps,
	PromoSectionCardProps,
} from 'calypso/components/promo-section';
import { CtaButton } from 'calypso/components/promo-section/promo-card/cta';
import wp from 'calypso/lib/wp';
import { useDispatch, useSelector } from 'calypso/state';
import { bumpStat, composeAnalytics, recordTracksEvent } from 'calypso/state/analytics/actions';
import { getConnectedAccountIdForSiteId } from 'calypso/state/memberships/settings/selectors';
import { canCurrentUser } from 'calypso/state/selectors/can-current-user';
import isSiteAutomatedTransfer from 'calypso/state/selectors/is-site-automated-transfer';
import siteHasFeature from 'calypso/state/selectors/site-has-feature';
import siteHasWordAds from 'calypso/state/selectors/site-has-wordads';
import { getSitePlanSlug } from 'calypso/state/sites/plans/selectors';
import { isJetpackSite } from 'calypso/state/sites/selectors';
import { getSelectedSite } from 'calypso/state/ui/selectors';
import { isRequestingWordAdsApprovalForSite } from 'calypso/state/wordads/approve/selectors';
import EarnSupportButton from './components/earn-support-button';
import StatsSection from './components/stats';
import { useEarnLaunchpadTasks } from './hooks/use-earn-launchpad-tasks';
import EarnLaunchpad from './launchpad';

import './style.scss';

const Home = () => {
	const translate = useTranslate();
	const dispatch = useDispatch();
	const [ peerReferralLink, setPeerReferralLink ] = useState( '' );
	const site = useSelector( ( state ) => getSelectedSite( state ) );
	const sitePlanSlug = useSelector( ( state ) => getSitePlanSlug( state, site?.ID ?? 0 ) );
	const hasWordAdsFeature = useSelector( ( state ) => siteHasWordAds( state, site?.ID ?? null ) );
	const isJetpack = useSelector( ( state ) => isJetpackSite( state, site?.ID ) );
	const isSiteTransfer = useSelector( ( state ) => isSiteAutomatedTransfer( state, site?.ID ) );
	const isUserAdmin = useSelector( ( state ) =>
		canCurrentUser( state, site?.ID, 'manage_options' )
	);
	const connectedAccountId = useSelector( ( state ) =>
		getConnectedAccountIdForSiteId( state, site?.ID )
	);
	const hasSimplePayments = useSelector( ( state ) =>
		siteHasFeature( state, site?.ID ?? null, FEATURE_SIMPLE_PAYMENTS )
	);
	const isRequestingWordAds = useSelector( ( state ) =>
		isRequestingWordAdsApprovalForSite( state, site )
	);

	const hasConnectedAccount = Boolean( connectedAccountId );
	const isNonAtomicJetpack = Boolean( isJetpack && ! isSiteTransfer );
	const hasSetupAds = Boolean( site?.options?.wordads || isRequestingWordAds );
	const isLoading = hasConnectedAccount === null || sitePlanSlug === null;

	const launchpad = useEarnLaunchpadTasks();

	function trackUpgrade( plan: string, feature: string ) {
		dispatch(
			composeAnalytics(
				recordTracksEvent( 'calypso_earn_page_upgrade_button_click', { plan, feature } ),
				bumpStat( 'calypso_earn_page', 'upgrade-button-' + feature )
			)
		);
	}

	function trackLearnLink( feature: string ) {
		dispatch(
			composeAnalytics(
				recordTracksEvent( 'calypso_earn_page_learn_link_click', { feature } ),
				bumpStat( 'calypso_earn_page', 'learn-link-' + feature )
			)
		);
	}

	function trackCtaButton( feature: string ) {
		dispatch(
			composeAnalytics(
				recordTracksEvent( 'calypso_earn_page_cta_button_click', { feature } ),
				bumpStat( 'calypso_earn_page', 'cta-button-' + feature )
			)
		);
	}

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
		const jetpackText = translate( 'Available with Jetpack Creator and Jetpack Complete.' );

		// Space isn't included in the translatable string to prevent it being easily missed.
		return isNonAtomicJetpack
			? ' ' + jetpackText
			: ' ' + translate( 'Available with any paid plan — no plugin required.' );
	};

	const getPremiumPlanNames = () => {
		const nonAtomicJetpackText = translate(
			'Available only with a Premium, Business, or Commerce plan.'
		);

		// Space isn't included in the translatable string to prevent it being easily missed.
		return isNonAtomicJetpack ? getAnyPlanNames() : ' ' + nonAtomicJetpackText;
	};

	/**
	 * Return the content to display in the Simple Payments card based on the current plan.
	 */
	const getSimplePaymentsCard = (): PromoSectionCardProps => {
		const cta = hasSimplePayments
			? {
					text: translate( 'Learn more' ),
					component: <EarnSupportButton supportContext="paypal" />,
					action: () => {
						trackCtaButton( 'simple-payments' );
						window.location.href = localizeUrl(
							'https://wordpress.com/support/wordpress-editor/blocks/pay-with-paypal/'
						);
					},
			  }
			: {
					text: translate( 'Unlock this feature' ),
					isPrimary: true,
					action: () => {
						trackUpgrade( 'plans', 'simple-payments' );
						page(
							addQueryArgs( `/plans/${ site?.slug }`, {
								feature: FEATURE_SIMPLE_PAYMENTS,
								plan: isNonAtomicJetpack ? PLAN_JETPACK_SECURITY_DAILY : PLAN_PREMIUM,
							} )
						);
					},
			  };
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
			},
		};
	};

	/**
	 * Return the content to display in the Recurring Payments card based on the current plan.
	 */
	const getRecurringPaymentsCard = (): PromoSectionCardProps => {
		const cta = {
			text: translate( 'Learn more' ),
			...( hasConnectedAccount && {
				component: <EarnSupportButton supportContext="payment_button_block" />,
			} ),
			action: () => {
				trackCtaButton( 'recurring-payments' );
				if ( window && window.location ) {
					window.location.href = localizeUrl( 'https://wordpress.com/payments-donations/' );
				}
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
			</>
		);

		return {
			title,
			body,
			icon: 'money',
			actions: {
				cta,
			},
		};
	};

	/**
	 * Return the content to display in the Donations card based on the current plan.
	 */
	const getDonationsCard = (): PromoSectionCardProps => {
		const cta = {
			text: translate( 'Learn more' ),
			...( hasConnectedAccount && {
				component: <EarnSupportButton supportContext="donations" />,
			} ),
			action: () => {
				trackCtaButton( 'donations' );
				if ( window && window.location ) {
					window.location.href = localizeUrl( 'https://wordpress.com/payments-donations/' );
				}
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
				<></>
			</>
		);

		return {
			title,
			body,
			icon: 'heart-outline',
			actions: {
				cta,
			},
		};
	};

	/**
	 * Return the content to display in the Premium Content Block card based on the current plan.
	 */
	const getPremiumContentCard = (): PromoSectionCardProps | undefined => {
		if ( isNonAtomicJetpack ) {
			return;
		}
		const cta = {
			text: translate( 'Learn more' ),
			component: <EarnSupportButton supportContext="premium_content_block" />,
			action: () => {
				trackLearnLink( 'premium-content' );
				if ( window && window.location ) {
					window.location.href = localizeUrl(
						'https://wordpress.com/support/wordpress-editor/blocks/premium-content-block/'
					);
				}
			},
		};
		const title = translate( 'Profit from subscriber-only content' );
		const hasConnectionBodyText = translate(
			'Create paid subscriptions so only subscribers can see selected content on your site — everyone else will see a paywall.'
		);
		const noConnectionBodyText = translate(
			'Create paid subscription options to share premium content like text, images, video, and any other content on your website.'
		);
		const body = <>{ hasConnectedAccount ? hasConnectionBodyText : noConnectionBodyText }</>;

		return {
			title,
			body,
			icon: 'bookmark-outline',
			actions: {
				cta,
			},
		};
	};

	/**
	 * Return the content to display in the Paid Newsletter card based on the current plan.
	 */
	const getPaidNewsletterCard = (): PromoSectionCardProps | undefined => {
		if ( isNonAtomicJetpack ) {
			return;
		}
		const cta = {
			text: translate( 'Learn more' ),
			component: <EarnSupportButton supportContext="paid-newsletters" />,
			action: () => {
				trackCtaButton( 'learn-paid-newsletters' );
				if ( window && window.location ) {
					window.location.href = localizeUrl( 'https://wordpress.com/support/paid-newsletters/' );
				}
			},
		};
		const title = translate( 'Send paid email newsletters' );
		const body = translate(
			'Share premium content with paying subscribers automatically through email.'
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
	 */
	const getPeerReferralsCard = (): PromoSectionCardProps | undefined => {
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
	 */
	const getAdsCard = (): PromoSectionCardProps => {
		const cta =
			hasWordAdsFeature || hasSetupAds
				? {
						text: hasSetupAds ? translate( 'View ad dashboard' ) : translate( 'Earn ad revenue' ),
						action: () => {
							trackCtaButton( 'ads' );
							page( `/earn/${ hasSetupAds ? 'ads-earnings' : 'ads-settings' }/${ site?.slug }` );
						},
				  }
				: {
						text: translate( 'Unlock this feature' ),
						isPrimary: true,
						action: () => {
							trackUpgrade( 'plans', 'ads' );
							page(
								`/plans/${ site?.slug }?feature=${ FEATURE_WORDADS_INSTANT }&plan=${ PLAN_PREMIUM }`
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
				{ ! hasWordAdsFeature && <em>{ getPremiumPlanNames() }</em> }
			</>
		);

		const learnMoreLink = ! ( hasWordAdsFeature || hasSetupAds )
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

	const getPlaceholderPromoCard = () => {
		return { title: '', body: '', image: <div /> };
	};

	const promos: PromoSectionProps = {
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
		<>
			<QueryMembershipsEarnings siteId={ site?.ID ?? 0 } />
			<QueryMembershipsSettings siteId={ site?.ID ?? 0 } />
			<QueryMembershipProducts siteId={ site?.ID ?? 0 } />
			{ isLoading && (
				<div className="earn__placeholder-promo-card">
					<PromoSection promos={ [ getPlaceholderPromoCard(), getPlaceholderPromoCard() ] } />
				</div>
			) }
			{ ! isLoading && (
				<div>
					{ launchpad.shouldLoad ? <EarnLaunchpad launchpad={ launchpad } /> : <StatsSection /> }
					<PromoSection { ...promos } />
				</div>
			) }
		</>
	);
};

export default Home;
