/**
 * External dependencies
 */
import React from 'react';
import { useSelector } from 'react-redux';
import { useTranslate } from 'i18n-calypso';
import { PLAN_PREMIUM, FEATURE_CLOUDFLARE_ANALYTICS } from '@automattic/calypso-products';

/**
 * Internal dependencies
 */
import cloudflareIllustration from 'calypso/assets/images/illustrations/cloudflare-logo-small.svg';
import config from '@automattic/calypso-config';
import { getSelectedSiteId } from 'calypso/state/ui/selectors';
import { getSitePlanSlug } from 'calypso/state/sites/plans/selectors';
import QuerySitePlans from 'calypso/components/data/query-site-plans';
import UpsellNudge from 'calypso/blocks/upsell-nudge';
import Banner from 'calypso/components/banner';

const Cloudflare = () => {
	const translate = useTranslate();
	const showCloudflare = config.isEnabled( 'cloudflare' );
	const siteId = useSelector( ( state ) => getSelectedSiteId( state ) ) || 0;
	const sitePlan = useSelector( ( state ) => getSitePlanSlug( state, siteId ) );
	const showUpsell = [ 'personal-bundle', 'free_plan', 'jetpack_free' ].includes( sitePlan );

	if ( ! showCloudflare ) return null;

	return (
		<>
			{ ! sitePlan && <QuerySitePlans siteId={ siteId } /> }
			{ !! sitePlan && ! showUpsell && (
				<Banner
					title={ translate( 'Discover more stats with Cloudflare Analytics' ) }
					description={ translate(
						'Cloudflare Analytics give you deeper insights into your site traffic and performance.'
					) }
					callToAction={ translate( 'Learn more' ) }
					disableCircle={ true }
					dismissPreferenceName="cloudflare-banner"
					event="calypso_stats_cloudflare_analytics_learn_more_click"
					highlight="info"
					horizontal={ true }
					href="https://www.cloudflare.com/pg-lp/cloudflare-for-wordpress-dot-com?utm_source=wordpress.com&utm_medium=affiliate&utm_campaign=paygo_2021-02_a8_pilot&utm_content=stats"
					iconPath={ cloudflareIllustration }
					showIcon={ true }
					tracksImpressionName="calypso_stats_cloudflare_banner_view"
					tracksClickProperties={ { plan: sitePlan } }
				/>
			) }
			{ !! sitePlan && showUpsell && (
				<UpsellNudge
					title={ translate( 'Upgrade your plan for even more stats' ) }
					description={ translate(
						'Get deeper insights into your site traffic and performance with Cloudflare Analytics.'
					) }
					plan={ PLAN_PREMIUM }
					feature={ FEATURE_CLOUDFLARE_ANALYTICS }
					tracksImpressionName="calypso_stats_cloudflare_upsell_view"
					event="calypso_stats_cloudflare_analytics_upsell_nudge_click"
					tracksClickProperties={ { plan: sitePlan } }
					showIcon={ true }
					callToAction={ translate( 'Upgrade' ) }
				/>
			) }
		</>
	);
};

export default Cloudflare;
