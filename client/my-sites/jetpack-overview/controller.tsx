import { getSelectedSite } from 'calypso/state/ui/selectors';
import ActivityLogFeaturePage from './feature-page-activity-log';
import AssetCdnFeaturePage from './feature-page-asset-cdn';
import BackupsFeaturePage from './feature-page-backups';
import BruteForceFeaturePage from './feature-page-brute-force';
import ContactFormFeaturePage from './feature-page-contact-form';
import CrmFeaturePage from './feature-page-crm';
import DonationsFeaturePage from './feature-page-donations';
import EarnFeaturePage from './feature-page-earn';
import EmailSubscriptionsFeaturePage from './feature-page-email-subscriptions';
import ImageCdnFeaturePage from './feature-page-image-cdn';
import JetpackSearchFeaturePage from './feature-page-jetpack-search';
import MalwareScanningFeaturePage from './feature-page-malware-scanning';
import PaidContentFeaturePage from './feature-page-paid-content';
import RecurringPaymentsFeaturePage from './feature-page-recurring-payments';
import RelatedPostsFeaturePage from './feature-page-related-posts';
import SeoFeaturePage from './feature-page-seo';
import SiteStatsFeaturePage from './feature-page-site-stats';
import SocialFeaturePage from './feature-page-social';
import SocialSharingFeaturePage from './feature-page-social-sharing';
import TopPostsFeaturePage from './feature-page-top-posts';
import UptimeMonitoringFeaturePage from './feature-page-uptime-monitoring';
import UtmTrackingFeaturePage from './feature-page-utm-tracking';
import VideoPressFeaturePage from './feature-page-videopress';
import WafFeaturePage from './feature-page-waf';
import WooAnalyticsFeaturePage from './feature-page-woo-analytics';
import JetpackOverview from './main';
import type { Context } from '@automattic/calypso-router';

function scrollTop() {
	if ( typeof window !== 'undefined' ) {
		window.scrollTo( 0, 0 );
	}
}

function makeRenderer( Component: React.ComponentType< { key?: React.Key } > ) {
	return async function ( context: Context, next: () => void ) {
		const site = getSelectedSite( context.store.getState() );
		scrollTop();
		context.primary = <Component key={ site?.ID } />;
		next();
	};
}

export default makeRenderer( JetpackOverview );

export const renderActivityLogPage = makeRenderer( ActivityLogFeaturePage );
export const renderAssetCdnPage = makeRenderer( AssetCdnFeaturePage );
export const renderBackupsPage = makeRenderer( BackupsFeaturePage );
export const renderBruteForcePage = makeRenderer( BruteForceFeaturePage );
export const renderContactFormPage = makeRenderer( ContactFormFeaturePage );
export const renderCrmPage = makeRenderer( CrmFeaturePage );
export const renderDonationsPage = makeRenderer( DonationsFeaturePage );
export const renderEarnPage = makeRenderer( EarnFeaturePage );
export const renderEmailSubscriptionsPage = makeRenderer( EmailSubscriptionsFeaturePage );
export const renderImageCdnPage = makeRenderer( ImageCdnFeaturePage );
export const renderJetpackSearchPage = makeRenderer( JetpackSearchFeaturePage );
export const renderMalwareScanningPage = makeRenderer( MalwareScanningFeaturePage );
export const renderPaidContentPage = makeRenderer( PaidContentFeaturePage );
export const renderRecurringPaymentsPage = makeRenderer( RecurringPaymentsFeaturePage );
export const renderRelatedPostsPage = makeRenderer( RelatedPostsFeaturePage );
export const renderSeoPage = makeRenderer( SeoFeaturePage );
export const renderSiteStatsPage = makeRenderer( SiteStatsFeaturePage );
export const renderSocialPage = makeRenderer( SocialFeaturePage );
export const renderSocialSharingPage = makeRenderer( SocialSharingFeaturePage );
export const renderTopPostsPage = makeRenderer( TopPostsFeaturePage );
export const renderUptimeMonitoringPage = makeRenderer( UptimeMonitoringFeaturePage );
export const renderUtmTrackingPage = makeRenderer( UtmTrackingFeaturePage );
export const renderVideoPressPage = makeRenderer( VideoPressFeaturePage );
export const renderWafPage = makeRenderer( WafFeaturePage );
export const renderWooAnalyticsPage = makeRenderer( WooAnalyticsFeaturePage );
