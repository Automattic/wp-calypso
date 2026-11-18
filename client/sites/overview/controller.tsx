import page from '@automattic/calypso-router';
import { dashboardLink } from 'calypso/dashboard/utils/link';
import { bumpStat } from 'calypso/lib/analytics/mc';
import { hasDashboardOptIn } from 'calypso/state/dashboard/selectors';
import { fetchPreferences } from 'calypso/state/preferences/actions';
import { hasReceivedRemotePreferences } from 'calypso/state/preferences/selectors';
import { getSelectedSite } from 'calypso/state/ui/selectors';
import DashboardBackportSiteOverview from '../v2/site-overview';
import type { Context as PageJSContext } from '@automattic/calypso-router';
import type { SiteExcerptData } from '@automattic/sites';
import type { CalypsoDispatch, IAppState } from 'calypso/state/types';

// Helper thunk that ensures that the user preferences has been fetched into Redux state before we
// continue working with it.
const waitForPrefs = () => async ( dispatch: CalypsoDispatch, getState: () => IAppState ) => {
	if ( hasReceivedRemotePreferences( getState() ) ) {
		return;
	}

	try {
		await dispatch( fetchPreferences() );
	} catch {
		// if the fetching of preferences fails, return gracefully and proceed to the next landing page candidate
	}
};

export function redirectToSiteOverview( context: PageJSContext ) {
	const { dispatch, getState } = context.store;
	const path = `/sites/${ context.params.site }`;

	dispatch( waitForPrefs() ).finally( () => {
		if ( hasDashboardOptIn( getState() ) ) {
			bumpStat( 'dashboard-redirect', 'site-overview' );
			window.location.replace( dashboardLink( path ) );
			return;
		}
		return page.redirect( path );
	} );
}

/**
 * Backport Hosting Dashboard Site Overview page to the current one.
 */
export async function dashboardBackportSiteOverview( context: PageJSContext, next: () => void ) {
	const { site: siteSlug } = context.params;
	const site = getSelectedSite( context.store.getState() ) as SiteExcerptData;

	const migrationStatus = site?.site_migration?.status_v2;
	if ( migrationStatus && migrationStatus !== 'completed' ) {
		bumpStat( 'dashboard-redirect', 'site-migration-overview' );
		// Just send them to the site overview, it'll go to the migration overview from there if still needed.
		window.location.replace( dashboardLink( `/sites/${ siteSlug }` ) );
		return;
	}

	// Route doesn't require a <PageViewTracker /> because the dashboard
	// fires its own page view events.
	context.primary = <DashboardBackportSiteOverview siteSlug={ siteSlug } />;

	next();
}
