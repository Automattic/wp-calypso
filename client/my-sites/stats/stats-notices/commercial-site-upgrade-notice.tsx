import { recordTracksEvent } from '@automattic/calypso-analytics';
import page from '@automattic/calypso-router';
import NoticeBanner from '@automattic/components/src/notice-banner';
import { localizeUrl } from '@automattic/i18n-utils';
import { Icon, external } from '@wordpress/icons';
import { useTranslate } from 'i18n-calypso';
import { useEffect } from 'react';
import { useLocalizedMoment } from 'calypso/components/localized-moment';
import usePlanUsageQuery from 'calypso/my-sites/stats/hooks/use-plan-usage-query';
import { useSelector } from 'calypso/state';
import getIsSiteWPCOM from 'calypso/state/selectors/is-site-wpcom';
import { trackStatsAnalyticsEvent } from '../utils';
import { StatsNoticeProps } from './types';

const STATS_GRACE_PERIOD_DAYS = 7;

const getStatsPurchaseURL = ( siteId: number | null, isOdysseyStats: boolean ) => {
	const from = isOdysseyStats ? 'jetpack' : 'calypso';
	const purchasePath = `/stats/purchase/${ siteId }?from=${ from }-stats-commercial-site-upgrade-notice&productType=commercial`;
	return purchasePath;
};

const CommercialSiteUpgradeNotice = ( {
	siteId,
	isOdysseyStats,
	showPaywallNotice,
}: StatsNoticeProps ) => {
	const translate = useTranslate();
	const isWPCOMSite = useSelector( ( state ) => siteId && getIsSiteWPCOM( state, siteId ) );

	// Determine date that paywall will go into effect (if applicable).
	// The paywall_date_from is the date the blog sticker was added.
	// Grace period is paywall_date_from value plus STATS_GRACE_PERIOD_DAYS.
	const moment = useLocalizedMoment();
	const { data } = usePlanUsageQuery( siteId );
	const dateFlagged = data?.paywall_date_from ? moment( data.paywall_date_from ) : moment();
	const paywallFromDate = dateFlagged.add( STATS_GRACE_PERIOD_DAYS, 'days' ).format( 'LL' );

	const gotoJetpackStatsProduct = () => {
		isOdysseyStats
			? recordTracksEvent(
					'jetpack_odyssey_stats_commercial_site_upgrade_notice_support_button_clicked'
			  )
			: recordTracksEvent( 'calypso_stats_commercial_site_upgrade_notice_support_button_clicked' );

		trackStatsAnalyticsEvent( 'stats_upgrade_clicked', {
			type: 'notice-commercial',
		} );

		// Allow some time for the event to be recorded before redirecting.
		setTimeout( () => page( getStatsPurchaseURL( siteId, isOdysseyStats ) ), 250 );
	};

	useEffect( () => {
		isOdysseyStats
			? recordTracksEvent( 'jetpack_odyssey_stats_commercial_site_upgrade_notice_viewed' )
			: recordTracksEvent( 'calypso_stats_commercial_site_upgrade_notice_viewed' );
	}, [ isOdysseyStats ] );

	let learnMoreLink = isWPCOMSite
		? 'https://wordpress.com/support/stats/#purchase-the-stats-add-on'
		: 'https://jetpack.com/redirect/?source=jetpack-stats-learn-more-about-new-pricing';

	if ( showPaywallNotice ) {
		learnMoreLink = 'https://jetpack.com/support/jetpack-stats/free-or-paid/';
	}

	const sharedTranslationComponents = {
		p: <p />,
		b: <strong />,
		jetpackStatsProductLink: (
			<button
				type="button"
				className="notice-banner__action-button"
				onClick={ gotoJetpackStatsProduct }
			/>
		),
		commercialUpgradeLink: (
			<a
				className="notice-banner__action-link"
				href={ localizeUrl( learnMoreLink ) }
				target="_blank"
				rel="noreferrer"
			/>
		),
		commercialUpgradeLinkText: <span />,
		externalIcon: <Icon className="stats-icon" icon={ external } size={ 24 } />,
	};

	const bannerBody = showPaywallNotice
		? translate(
				'{{p}}Commercial sites require a commercial license. You will lose access to core Stats features on {{b}}%(date)s{{/b}}.{{/p}}{{p}}{{jetpackStatsProductLink}}Upgrade my Stats{{/jetpackStatsProductLink}}{{commercialUpgradeLink}}{{commercialUpgradeLinkText}}Learn more{{/commercialUpgradeLinkText}}{{externalIcon /}}{{/commercialUpgradeLink}}{{/p}}',
				{
					args: { date: paywallFromDate },
					components: sharedTranslationComponents,
				}
		  ) // Paywall notice content.
		: translate(
				'{{p}}Upgrade to get priority support and access to upcoming advanced features. You’ll need to purchase a commercial license based on your site type. {{/p}}{{p}}{{jetpackStatsProductLink}}Upgrade my Stats{{/jetpackStatsProductLink}} {{commercialUpgradeLink}}{{commercialUpgradeLinkText}}Learn more{{/commercialUpgradeLinkText}}{{externalIcon /}}{{/commercialUpgradeLink}}{{/p}}',
				{
					components: sharedTranslationComponents,
				}
		  );

	const bannerTitle = showPaywallNotice
		? translate( 'You need to upgrade to a commercial license to continue using Jetpack Stats' )
		: translate( 'Upgrade to Stats Commercial' );

	return (
		<div
			className={ `inner-notice-container has-odyssey-stats-bg-color ${
				! isOdysseyStats && 'inner-notice-container--calypso'
			}` }
		>
			<NoticeBanner
				level={ showPaywallNotice ? 'error' : 'info' }
				title={ bannerTitle }
				onClose={ () => {} }
				hideCloseButton
			>
				{ bannerBody }
			</NoticeBanner>
		</div>
	);
};

export default CommercialSiteUpgradeNotice;
