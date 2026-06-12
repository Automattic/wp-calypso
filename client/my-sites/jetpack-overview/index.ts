import page from '@automattic/calypso-router';
import { makeLayout, render as clientRender } from 'calypso/controller';
import { navigation, siteSelection } from 'calypso/my-sites/controller';
import renderJetpackOverview, {
	renderActivityLogPage,
	renderAssetCdnPage,
	renderBackupsPage,
	renderBruteForcePage,
	renderContactFormPage,
	renderCrmPage,
	renderDonationsPage,
	renderEarnPage,
	renderEmailSubscriptionsPage,
	renderImageCdnPage,
	renderJetpackSearchPage,
	renderMalwareScanningPage,
	renderPaidContentPage,
	renderRecurringPaymentsPage,
	renderRelatedPostsPage,
	renderSeoPage,
	renderSiteStatsPage,
	renderSocialPage,
	renderSocialSharingPage,
	renderTopPostsPage,
	renderUptimeMonitoringPage,
	renderUtmTrackingPage,
	renderVideoPressPage,
	renderWafPage,
	renderWooAnalyticsPage,
} from './controller';

const mw = [ siteSelection, navigation ] as const;
const layout = [ makeLayout, clientRender ] as const;

function feature( path: string, handler: PageJS.Callback ) {
	page( path, ...mw, handler, ...layout );
}

export default function () {
	// Feature detail pages — all before the :site catch-all
	feature( '/jetpack-features/:site/activity-log', renderActivityLogPage );
	feature( '/jetpack-features/:site/asset-cdn', renderAssetCdnPage );
	feature( '/jetpack-features/:site/backups', renderBackupsPage );
	feature( '/jetpack-features/:site/brute-force', renderBruteForcePage );
	feature( '/jetpack-features/:site/contact-form', renderContactFormPage );
	feature( '/jetpack-features/:site/crm', renderCrmPage );
	feature( '/jetpack-features/:site/donations', renderDonationsPage );
	feature( '/jetpack-features/:site/earn', renderEarnPage );
	feature( '/jetpack-features/:site/email-subscriptions', renderEmailSubscriptionsPage );
	feature( '/jetpack-features/:site/image-cdn', renderImageCdnPage );
	feature( '/jetpack-features/:site/malware-scanning', renderMalwareScanningPage );
	feature( '/jetpack-features/:site/paid-content', renderPaidContentPage );
	feature( '/jetpack-features/:site/recurring-payments', renderRecurringPaymentsPage );
	feature( '/jetpack-features/:site/related-posts', renderRelatedPostsPage );
	feature( '/jetpack-features/:site/search', renderJetpackSearchPage );
	feature( '/jetpack-features/:site/seo', renderSeoPage );
	feature( '/jetpack-features/:site/site-stats', renderSiteStatsPage );
	feature( '/jetpack-features/:site/social', renderSocialPage );
	feature( '/jetpack-features/:site/social-sharing', renderSocialSharingPage );
	feature( '/jetpack-features/:site/top-posts', renderTopPostsPage );
	feature( '/jetpack-features/:site/uptime-monitoring', renderUptimeMonitoringPage );
	feature( '/jetpack-features/:site/utm-tracking', renderUtmTrackingPage );
	feature( '/jetpack-features/:site/videopress', renderVideoPressPage );
	feature( '/jetpack-features/:site/waf', renderWafPage );
	feature( '/jetpack-features/:site/woo-analytics', renderWooAnalyticsPage );

	// Main interstitial
	feature( '/jetpack-features/:site', renderJetpackOverview );
}
