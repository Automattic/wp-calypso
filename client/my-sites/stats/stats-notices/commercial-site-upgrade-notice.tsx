import { recordTracksEvent } from '@automattic/calypso-analytics';
import page from '@automattic/calypso-router';
import NoticeBanner from '@automattic/components/src/notice-banner';
import { localizeUrl } from '@automattic/i18n-utils';
import { Icon, external } from '@wordpress/icons';
import { useTranslate } from 'i18n-calypso';
import { useEffect } from 'react';
import { STATS_PRODUCT_NAME } from 'calypso/my-sites/stats/constants';
import usePlanUsageQuery from 'calypso/my-sites/stats/hooks/use-plan-usage-query';
import { useSelector } from 'calypso/state';
import getIsSiteWPCOM from 'calypso/state/selectors/is-site-wpcom';
import { trackStatsAnalyticsEvent } from '../utils';
import { StatsNoticeProps } from './types';

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

	// Determine when the paywall will go into effect (if applicable).
	// The upgrade_deadline_date is the actual date the paywall will be applied.
	const { data } = usePlanUsageQuery( siteId );
	// Guard against empty value in the API response.
	const paywallUpgradeDeadlineDate = data?.upgrade_deadline_date;

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

	// Banner body will show an explict paywall date if provided.
	let bannerBody = null;
	if ( ! showPaywallNotice ) {
		bannerBody = translate(
			'{{p}}Upgrade to get priority support and access to upcoming advanced features. You’ll need to purchase a commercial license based on your site type. {{/p}}{{p}}{{jetpackStatsProductLink}}Upgrade my Stats{{/jetpackStatsProductLink}} {{commercialUpgradeLink}}{{commercialUpgradeLinkText}}Learn more{{/commercialUpgradeLinkText}}{{externalIcon /}}{{/commercialUpgradeLink}}{{/p}}',
			{
				components: sharedTranslationComponents,
			}
		);
	} else if ( ! paywallUpgradeDeadlineDate ) {
		bannerBody = translate(
			'{{p}}To ensure uninterrupted access to core Stats features, please upgrade to a %(product)s Commercial license using the button below. {{/p}}{{p}}{{jetpackStatsProductLink}}Upgrade my Stats{{/jetpackStatsProductLink}} {{commercialUpgradeLink}}{{commercialUpgradeLinkText}}Learn more{{/commercialUpgradeLinkText}}{{externalIcon /}}{{/commercialUpgradeLink}}{{/p}}',
			{
				args: { product: STATS_PRODUCT_NAME },
				components: sharedTranslationComponents,
			}
		);
	} else {
		bannerBody = translate(
			'{{p}}To ensure uninterrupted access to core Stats features, please upgrade to a %(product)s Commercial license using the button below by {{b}}%(date)s{{/b}}. {{/p}}{{p}}{{jetpackStatsProductLink}}Upgrade my Stats{{/jetpackStatsProductLink}}{{commercialUpgradeLink}}{{commercialUpgradeLinkText}}Learn more{{/commercialUpgradeLinkText}}{{externalIcon /}}{{/commercialUpgradeLink}}{{/p}}',
			{
				args: { date: paywallUpgradeDeadlineDate, product: STATS_PRODUCT_NAME },
				components: sharedTranslationComponents,
			}
		);
	}

	const bannerTitle = showPaywallNotice
		? ( translate( 'You need to upgrade to a commercial license to continue using %(product)s', {
				args: { product: STATS_PRODUCT_NAME },
		  } ) as string )
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
