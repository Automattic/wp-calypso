import {
	FEATURE_SIMPLE_PAYMENTS,
	FEATURE_WORDADS_INSTANT,
	GROUP_WPCOM,
	PLAN_BUSINESS,
	PLAN_ECOMMERCE,
	PLAN_JETPACK_SECURITY_DAILY,
	PLAN_PREMIUM,
	getPlan,
	isMonthly,
	planMatches,
} from '@automattic/calypso-products';
import page from '@automattic/calypso-router';
import { getCalypsoUrl } from '@automattic/calypso-url';
import { localizeUrl } from '@automattic/i18n-utils';
import { addQueryArgs } from '@wordpress/url';
import { useTranslate } from 'i18n-calypso';
import { compact } from 'lodash';
import { useState, useEffect } from 'react';
import ClipboardButtonInput from 'calypso/components/clipboard-button-input';
import QueryMembershipProducts from 'calypso/components/data/query-memberships';
import QueryMembershipsEarnings from 'calypso/components/data/query-memberships-earnings';
import QueryMembershipsSettings from 'calypso/components/data/query-memberships-settings';
import QuerySitePlans from 'calypso/components/data/query-site-plans';
import EmptyContent from 'calypso/components/empty-content';
import PromoSection, {
	Props as PromoSectionProps,
	PromoSectionCardProps,
} from 'calypso/components/promo-section';
import { PromoCardVariation } from 'calypso/components/promo-section/promo-card';
import { CtaButton } from 'calypso/components/promo-section/promo-card/cta';
import isJetpackCloud from 'calypso/lib/jetpack/is-jetpack-cloud';
import wp from 'calypso/lib/wp';
import { useDispatch, useSelector } from 'calypso/state';
import { bumpStat, composeAnalytics, recordTracksEvent } from 'calypso/state/analytics/actions';
import { getIsConnectedForSiteId } from 'calypso/state/memberships/settings/selectors';
import { errorNotice } from 'calypso/state/notices/actions';
import { canCurrentUser } from 'calypso/state/selectors/can-current-user';
import isSiteAutomatedTransfer from 'calypso/state/selectors/is-site-automated-transfer';
import siteHasFeature from 'calypso/state/selectors/site-has-feature';
import siteHasWordAds from 'calypso/state/selectors/site-has-wordads';
import { getSitePlanSlug } from 'calypso/state/sites/plans/selectors';
import { isJetpackSite, isSimpleSite } from 'calypso/state/sites/selectors';
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
	const [ isPeerReferralCtaDisabled, setPeerReferralCtaDisabled ] = useState( false );
	const site = useSelector( getSelectedSite );
	const sitePlanSlug = useSelector( ( state ) => getSitePlanSlug( state, site?.ID ?? 0 ) );
	const hasWordAdsFeature = useSelector( ( state ) => siteHasWordAds( state, site?.ID ?? null ) );
	const isJetpack = useSelector( ( state ) => isJetpackSite( state, site?.ID ) );
	const isSiteTransfer = useSelector( ( state ) => isSiteAutomatedTransfer( state, site?.ID ) );
	const isUserAdmin = useSelector( ( state ) =>
		canCurrentUser( state, site?.ID, 'manage_options' )
	);
	const hasConnectedAccount = useSelector( ( state ) =>
		getIsConnectedForSiteId( state, site?.ID )
	);
	const hasSimplePayments = useSelector( ( state ) =>
		siteHasFeature( state, site?.ID ?? null, FEATURE_SIMPLE_PAYMENTS )
	);
	const isRequestingWordAds = useSelector( ( state ) =>
		isRequestingWordAdsApprovalForSite( state, site )
	);
	const isSimple = useSelector( ( state ) => isSimpleSite( state, site?.ID ) );
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
			( errorResponse: { error: string; message: string }, peerReferralLink: string ) => {
				if ( errorResponse ) {
					setPeerReferralCtaDisabled( true );
					dispatch( errorNotice( errorResponse.message ) );
					return;
				}

				setPeerReferralLink( peerReferralLink );
			}
		);
	};

	const getAnyPlanNames = () => {
		const jetpackText = translate( 'Available with Jetpack Creator, or a bundled plan.' );

		// Space isn't included in the translatable string to prevent it being easily missed.
		return isNonAtomicJetpack
			? ' ' + jetpackText
			: ' ' + translate( 'Available with any paid plan — no plugin required.' );
	};

	const getPremiumPlanNames = () => {
		const nonAtomicJetpackText = translate(
			// Translators: %(premiumPlanName)s is Explorer or Premium, %(businessPlanName)s is Creator or Business, %(commercePlanName)s is Entrepreneur or eCommerce.
			'Available only with a %(premiumPlanName)s, %(businessPlanName)s, or %(commercePlanName)s plan.',
			{
				args: {
					premiumPlanName: getPlan( PLAN_PREMIUM )?.getTitle() || '',
					businessPlanName: getPlan( PLAN_BUSINESS )?.getTitle() || '',
					commercePlanName: getPlan( PLAN_ECOMMERCE )?.getTitle() || '',
				},
			}
		);
		// Space isn't included in the translatable string to prevent it being easily missed.
		return isNonAtomicJetpack ? getAnyPlanNames() : ' ' + nonAtomicJetpackText;
	};

	/**
	 * Return the content to display in the Simple Payments card based on the current plan.
	 */
	const getSimplePaymentsCard = (): PromoSectionCardProps => {
		const ctaURL = isJetpackCloud()
			? 'https://jetpack.com/support/pay-with-paypal/'
			: 'https://wordpress.com/support/wordpress-editor/blocks/pay-with-paypal/';

		const cta = hasSimplePayments
			? {
					text: translate( 'Learn more' ),
					...( ! isJetpackCloud() && {
						component: <EarnSupportButton supportContext="paypal" />,
					} ),
					action: () => {
						trackCtaButton( 'simple-payments' );
						window.location.href = localizeUrl( ctaURL );
					},
			  }
			: {
					text: translate( 'Unlock this feature' ),
					isPrimary: true,
					action: () => {
						trackUpgrade( 'plans', 'simple-payments' );
						const url = addQueryArgs( `/plans/${ site?.slug }`, {
							feature: FEATURE_SIMPLE_PAYMENTS,
							plan: isNonAtomicJetpack ? PLAN_JETPACK_SECURITY_DAILY : PLAN_PREMIUM,
						} );
						/**
						 * If the site is Simple, redirect to WP.com plans page even if it's a Jetpack Cloud site.
						 */
						if ( isSimple && isJetpackCloud() ) {
							page( getCalypsoUrl( url ) );
							return;
						}
						/**
						 * Otherwise, the destination is either Jetpack Cloud `/pricing` page or WP.com plans page
						 * depending on where the user is.
						 */
						page( url );
					},
			  };
		const title = translate( 'Collect PayPal payments' );
		const body = translate(
			'Accept credit and debit card payments via PayPal for physical products, services, donations, tips, or memberships.'
		);

		return {
			title,
			body,
			icon: 'credit-card',
			variation: PromoCardVariation.Compact,
			actions: {
				cta,
			},
		};
	};

	/**
	 * Return the content to display in the Recurring Payments card based on the current plan.
	 */
	const getRecurringPaymentsCard = (): PromoSectionCardProps => {
		const ctaURL = isJetpackCloud()
			? 'https://jetpack.com/support/jetpack-blocks/payments-block/'
			: 'https://wordpress.com/payments-donations/';
		const cta = {
			text: translate( 'Learn more' ),
			...( ! isJetpackCloud() &&
				hasConnectedAccount && {
					component: <EarnSupportButton supportContext="payment_button_block" />,
				} ),
			action: () => {
				trackCtaButton( 'recurring-payments' );
				if ( window && window.location ) {
					window.location.href = localizeUrl( ctaURL );
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
			variation: PromoCardVariation.Compact,
			actions: {
				cta,
			},
		};
	};

	/**
	 * Return the content to display in the Donations card based on the current plan.
	 */
	const getDonationsCard = (): PromoSectionCardProps => {
		const ctaURL = isJetpackCloud()
			? 'https://jetpack.com/support/jetpack-blocks/donations-block/'
			: 'https://wordpress.com/payments-donations/';

		const cta = {
			text: translate( 'Learn more' ),
			...( ! isJetpackCloud() &&
				hasConnectedAccount && {
					component: <EarnSupportButton supportContext="donations" />,
				} ),
			action: () => {
				trackCtaButton( 'donations' );
				if ( window && window.location ) {
					window.location.href = localizeUrl( ctaURL );
				}
			},
		};

		const title = translate( 'Receive donations and tips' );

		const body = translate(
			'The Donations Form block lets you accept credit and debit card payments for one-time donations, contributions, and tips.'
		);

		return {
			title,
			body,
			icon: 'heart-outline',
			variation: PromoCardVariation.Compact,
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
		const ctaURL = isJetpackCloud()
			? 'https://jetpack.com/support/jetpack-blocks/paid-content-block/'
			: 'https://wordpress.com/support/wordpress-editor/blocks/premium-content-block/';

		const cta = {
			text: translate( 'Learn more' ),
			...( ! isJetpackCloud() && {
				component: <EarnSupportButton supportContext="premium_content_block" />,
			} ),
			action: () => {
				trackLearnLink( 'premium-content' );
				if ( window && window.location ) {
					window.location.href = localizeUrl( ctaURL );
				}
			},
		};
		const title = translate( 'Create subscriber-only content' );
		const body = translate(
			'Create paid subscription options and gate access to text, video, image, or any other kind of content.'
		);

		return {
			title,
			body,
			icon: 'bookmark-outline',
			variation: PromoCardVariation.Compact,
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
		const ctaURL = isJetpackCloud()
			? 'https://jetpack.com/support/newsletter/paid-newsletters/'
			: 'https://wordpress.com/support/paid-newsletters/';

		const cta = {
			text: translate( 'Learn more' ),
			...( ! isJetpackCloud() && {
				component: <EarnSupportButton supportContext="paid-newsletters" />,
			} ),
			action: () => {
				trackCtaButton( 'learn-paid-newsletters' );
				if ( window && window.location ) {
					window.location.href = localizeUrl( ctaURL );
				}
			},
		};
		const title = translate( 'Set up a paid newsletter' );
		const body = translate(
			'Reach and grow your audience with a newsletter and earn with paid subscriptions, gated content options, and one-time offerings.'
		);

		return {
			title,
			body,
			icon: 'mail',
			variation: PromoCardVariation.Compact,
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

		const isEligible =
			planMatches( sitePlanSlug ?? '', { group: GROUP_WPCOM } ) &&
			! isMonthly( sitePlanSlug ?? '' );

		const cta: CtaButton = isEligible
			? {
					text: translate( 'Earn free credits' ),
					action: () => {
						trackCtaButton( 'peer-referral-wpcom' );
						onPeerReferralCtaClick();
					},
					disabled: isPeerReferralCtaDisabled,
			  }
			: {
					text: translate( 'Unlock this feature' ),
					isPrimary: true,
					action: () => {
						trackUpgrade( 'plans', 'peer-referral' );
						page( `/plans/${ site?.slug }` );
					},
			  };

		if ( peerReferralLink && isEligible ) {
			cta.component = <ClipboardButtonInput value={ localizeUrl( peerReferralLink ) } />;
		}

		const defaultBody = translate(
			'Share WordPress.com with friends, family, and website visitors. For every paying customer you send our way, you’ll both earn US$25 in free credits.'
		);
		const eligibleBody = peerReferralLink
			? translate(
					'Share the link below and, for every paying customer you send our way, you’ll both earn US$25 in credits.'
			  )
			: translate(
					'Share WordPress.com with friends, family, and website visitors. For every paying customer you send our way, you’ll both earn US$25 in free credits. By clicking “Earn free credits”, you agree to {{a}}these terms{{/a}}.',
					{
						components: {
							a: (
								<a
									href="https://wordpress.org/about/privacy/"
									target="_blank"
									rel="noopener noreferrer"
								/>
							),
						},
					}
			  );
		return {
			title: translate( 'Refer a friend' ),
			body: isEligible ? eligibleBody : defaultBody,
			icon: 'user-add',
			variation: PromoCardVariation.Compact,
			actions: {
				cta,
			},
		};
	};

	/**
	 * Return the content to display in the Ads card based on the current plan.
	 */
	const getAdsCard = (): PromoSectionCardProps => {
		const earnPath = ! isJetpackCloud() ? '/earn' : '/monetize';

		const cta =
			hasWordAdsFeature || hasSetupAds
				? {
						text: hasSetupAds ? translate( 'View ad dashboard' ) : translate( 'Earn ad revenue' ),
						action: () => {
							trackCtaButton( 'ads' );
							page(
								`${ earnPath }/${ hasSetupAds ? 'ads-earnings' : 'ads-settings' }/${ site?.slug }`
							);
						},
				  }
				: {
						text: translate( 'Unlock this feature' ),
						isPrimary: true,
						action: () => {
							trackUpgrade( 'plans', 'ads' );
							const url = addQueryArgs( `/plans/${ site?.slug }`, {
								feature: FEATURE_WORDADS_INSTANT,
								plan: PLAN_PREMIUM,
							} );
							/**
							 * If the site is Simple, redirect to WP.com plans page even if it's a Jetpack Cloud site.
							 */
							if ( isSimple && isJetpackCloud() ) {
								page( getCalypsoUrl( url ) );
								return;
							}
							/**
							 * Otherwise, the destination is either Jetpack Cloud `/pricing` page or WP.com plans page
							 * depending on where the user is.
							 */
							page( url );
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
					'Make money each time someone visits your site by displaying ads on your posts and pages.'
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
			variation: PromoCardVariation.Compact,
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
		return <EmptyContent title={ translate( 'You are not authorized to view this page' ) } />;
	}

	return (
		<>
			<QueryMembershipsEarnings siteId={ site?.ID ?? 0 } />
			<QueryMembershipsSettings siteId={ site?.ID ?? 0 } />
			<QueryMembershipProducts siteId={ site?.ID ?? 0 } />
			<QuerySitePlans siteId={ site?.ID ?? 0 } />
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
