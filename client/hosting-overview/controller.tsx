import { isEnabled } from '@automattic/calypso-config';
import { Context as PageJSContext } from '@automattic/calypso-router';
import HostingOverview from 'calypso/hosting-overview/components/hosting-overview';
import HostingActivate from 'calypso/my-sites/hosting/hosting-activate';
import Hosting from 'calypso/my-sites/hosting/main';
import MySitesNavigation from 'calypso/my-sites/navigation';
import SitesDashboardV2 from 'calypso/sites-dashboard-v2';
import {
	DOTCOM_HOSTING_CONFIG,
	DOTCOM_OVERVIEW,
} from 'calypso/sites-dashboard-v2/site-preview-pane/constants';
import { isGlobalSiteViewEnabled } from 'calypso/state/sites/selectors';
import { getSelectedSite, getSelectedSiteId } from 'calypso/state/ui/selectors';

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

export function hostingOverview( context: PageJSContext, next: () => void ) {
	context.secondary = <MySitesNavigation path={ context.path } />;
	context.primary = shouldShowInSitesFlyoutPanel( context, DOTCOM_OVERVIEW ) ?? <HostingOverview />;
	next();
}

export function hostingConfiguration( context: PageJSContext, next: () => void ) {
	context.secondary = <MySitesNavigation path={ context.path } />;
	context.primary = shouldShowInSitesFlyoutPanel( context, DOTCOM_HOSTING_CONFIG ) ?? (
		<div className="hosting-configuration">
			<Hosting />
		</div>
	);
	next();
}

export function hostingActivate( context: PageJSContext, next: () => void ) {
	context.secondary = <MySitesNavigation path={ context.path } />;
	context.primary = shouldShowInSitesFlyoutPanel( context, DOTCOM_HOSTING_CONFIG ) ?? (
		<div className="hosting-configuration">
			<HostingActivate />
		</div>
	);
	next();
}
