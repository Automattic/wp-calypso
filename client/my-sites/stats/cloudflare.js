/**
 * External dependencies
 */
import React from 'react';
import { useSelector } from 'react-redux';
import { useTranslate } from 'i18n-calypso';

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
	const showUpsell = [ 'personal-bundle', 'free_plan' ].includes( sitePlan );

	return (
		<>
			{ showCloudflare && (
				<>
					{ ! sitePlan && <QuerySitePlans siteId={ siteId } /> }
					{ sitePlan && ! showUpsell && (
						<Banner
							title={ translate( 'Discover more stats with Cloudflare Analytics' ) }
							description={ translate(
								'Cloudflare Analytics give you deeper insights into your site traffic and performance.'
							) }
							showIcon={ true }
							disableCircle={ true }
							iconPath={ cloudflareIllustration }
							href="CLOUDFLARELEARNMORELINK"
							tracksImpressionName="calypso_stats_cloudflare_banner_view"
							event="calypso_stats_cloudflare_analytics_learn_more_click"
							callToAction={ translate( 'Learn more' ) }
						/>
					) }
					{ sitePlan && showUpsell && (
						<UpsellNudge
							title={ translate( 'Upgrade your plan for even more stats' ) }
							description={ translate(
								'Get deeper insights into your site traffic and performance with Cloudflare Analytics.'
							) }
							customerType="business"
							tracksImpressionName="calypso_stats_cloudflare_upsell_view"
							event="calypso_stats_cloudflare_analytics_upsell_nudge_click"
							showIcon={ true }
							callToAction={ translate( 'Upgrade' ) }
						/>
					) }
				</>
			) }
		</>
	);
};

export default Cloudflare;
