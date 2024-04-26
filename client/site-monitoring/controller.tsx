import { isEnabled } from '@automattic/calypso-config';
import MySitesNavigation from 'calypso/my-sites/navigation';
import SitesDashboardV2 from 'calypso/sites-dashboard-v2';
import {
	DOTCOM_MONITORING,
	DOTCOM_PHP_LOGS,
	DOTCOM_SERVER_LOGS,
} from 'calypso/sites-dashboard-v2/site-preview-pane/constants';
import { isGlobalSiteViewEnabled } from 'calypso/state/sites/selectors';
import { getSelectedSite, getSelectedSiteId } from 'calypso/state/ui/selectors';
import SiteMonitoringPhpLogs from './components/php-logs';
import SiteMonitoringServerLogs from './components/server-logs';
import SiteMonitoringOverview from './components/site-monitoring-overview';
import type { Context as PageJSContext } from '@automattic/calypso-router';

function shouldShowInSitesFlyoutPanel( context: PageJSContext, feature: string ) {
	const state = context.store.getState();
	const selectedSiteId = getSelectedSiteId( state );

	// Show the hosting configuration page in the preview pane from the sites dashboard.
	if (
		isEnabled( 'layout/dotcom-nav-redesign-v2' ) &&
		isGlobalSiteViewEnabled( state, selectedSiteId )
	) {
		const selectedSite = getSelectedSite( state );
		return (
			// Sites Dashboard V2 - Dotcom Nav Redesign V2
			<SitesDashboardV2
				queryParams={ {} }
				selectedSite={ selectedSite }
				selectedFeature={ feature }
			/>
		);
	}
}

export function siteMonitoringOverview( context: PageJSContext, next: () => void ) {
	context.secondary = <MySitesNavigation path={ context.path } />;

	context.primary = shouldShowInSitesFlyoutPanel( context, DOTCOM_MONITORING ) ?? (
		<SiteMonitoringOverview />
	);

	next();
}

export function siteMonitoringPhpLogs( context: PageJSContext, next: () => void ) {
	context.secondary = <MySitesNavigation path={ context.path } />;

	context.primary = shouldShowInSitesFlyoutPanel( context, DOTCOM_PHP_LOGS ) ?? (
		<SiteMonitoringPhpLogs />
	);

	next();
}

export function siteMonitoringServerLogs( context: PageJSContext, next: () => void ) {
	context.secondary = <MySitesNavigation path={ context.path } />;

	context.primary = shouldShowInSitesFlyoutPanel( context, DOTCOM_SERVER_LOGS ) ?? (
		<SiteMonitoringServerLogs />
	);

	next();
}
