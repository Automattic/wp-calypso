/**
 * External dependencies
 */
import React from 'react';
import { localize } from 'i18n-calypso';

/**
 * Internal dependencies
 */
import PurchaseDetail from 'components/purchase-detail';
import GoogleVoucherDetails from 'my-sites/upgrades/checkout-thank-you/google-voucher';
import QuerySiteVouchers from 'components/data/query-site-vouchers';

export const FindNewThemeFeature = localize( ( { selectedSite, translate } ) => {
	return (
		<PurchaseDetail
			icon="customize"
			title={ translate( 'Find a new theme' ) }
			description={ translate( 'All our premium themes are now available at no extra cost. Try them out now.' ) }
			buttonText={ translate( 'Browse premium themes' ) }
			href={ '/design/' + selectedSite.slug }
		/>
	);
} );

export const AdvertisingRemovedFeature = localize( ( { isBusinessPlan, translate } ) => {
	return (
		<PurchaseDetail
			icon="speaker"
			title={ translate( 'Advertising Removed' ) }
			description={ isBusinessPlan
				? translate( 'With your plan, all WordPress.com advertising has been removed from your site.' )
				: translate( 'With your plan, all WordPress.com advertising has been removed from your site.' +
					' You can upgrade to a Business plan to also remove the WordPress.com footer credit.' )
			}
		/>
	);
} );

export const CustomizeThemeFeature = localize( ( { customizeLink, isCustomizeEnabled, translate } ) => {
	return (
		<PurchaseDetail
			icon="customize"
			title={ translate( 'Customize your theme' ) }
			description={
				translate(
					"You now have direct control over your site's fonts and colors in the customizer. " +
					"Change your site's entire look in a few clicks."
				)
			}
			buttonText={ translate( 'Start customizing' ) }
			href={ customizeLink }
			target={ isCustomizeEnabled ? undefined : '_blank' }
		/>
	);
} );

export const VideoAudioPostsFeature = localize( ( { paths, selectedSite, translate } ) => {
	return (
		<PurchaseDetail
			icon="image-multiple"
			title={ translate( 'Video and audio posts' ) }
			description={
				translate(
					'Enrich your posts with video and audio, uploaded directly on your site. ' +
					'No ads or limits. The Premium plan also adds 10GB of file storage.'
				)
			}
			buttonText={ translate( 'Start a new post' ) }
			href={ paths.newPost( selectedSite ) }
		/>
	);
} );

export const MonetizeSiteFeature = localize( ( { selectedSite, translate } ) => {
	return (
		<PurchaseDetail
			icon="speaker"
			title={ translate( 'Easily monetize your site' ) }
			description={
				translate(
					'Take advantage of WordAds instant activation on your upgraded site. ' +
					'WordAds lets you earn money by displaying promotional content.'
				)
			}
			buttonText={ translate( 'Start Earning' ) }
			href={ '/ads/settings/' + selectedSite.slug }
		/>
	);
} );

export const GoogleAnalyticsStatsFeature = localize( ( { selectedSite, translate } ) => {
	return (
		<PurchaseDetail
			icon="stats-alt"
			title={ translate( 'Stats from Google Analytics' ) }
			description={ translate( 'Connect to Google Analytics for the perfect complement to WordPress.com stats.' ) }
			buttonText={ translate( 'Connect Google Analytics' ) }
			href={ '/settings/analytics/' + selectedSite.slug }
		/>
	);
} );

export const CustomDomainFeature = localize( ( { selectedSite, translate } ) => {
	return (
		<PurchaseDetail
			icon="globe"
			title={ translate( 'Get your custom domain' ) }
			description={
				translate(
					"Replace your site's address, {{em}}%(siteDomain)s{{/em}}, with a custom domain. " +
					'A free domain is included with your plan.',
					{
						args: { siteDomain: selectedSite.slug },
						components: { em: <em /> }
					}
				)
			}
			buttonText={ translate( 'Claim your free domain' ) }
			href={ '/domains/add/' + selectedSite.slug }
		/>
	);
} );

export const GoogleVouchersFeature = ( { selectedSite } ) => {
	return (
		<div>
			<QuerySiteVouchers siteId={ selectedSite.ID } />
			<GoogleVoucherDetails selectedSite={ selectedSite } />
		</div>
	);
};
