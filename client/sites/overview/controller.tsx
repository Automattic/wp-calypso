import { isEnabled } from '@automattic/calypso-config';
import page from '@automattic/calypso-router';
import { dashboardLink } from 'calypso/dashboard/utils/link';
import { isMigrationInProgress } from 'calypso/data/site-migration';
import PageViewTracker from 'calypso/lib/analytics/page-view-tracker';
import { hasDashboardOptIn } from 'calypso/state/dashboard/selectors';
import { fetchPreferences } from 'calypso/state/preferences/actions';
import { hasReceivedRemotePreferences } from 'calypso/state/preferences/selectors';
import { getSelectedSite } from 'calypso/state/ui/selectors';
import { getRouteFromContext } from 'calypso/utils';
import DashboardBackportSiteOverview from '../v2/site-overview';
import HostingOverview from './components/hosting-overview';
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

function overview( context: PageJSContext, next: () => void ) {
	context.primary = (
		<>
			<PageViewTracker title="Sites > Overview" path={ getRouteFromContext( context ) } />
			<HostingOverview />
		</>
	);
	next();
}

export function redirectToSiteOverview( context: PageJSContext ) {
	const { dispatch, getState } = context.store;
	const path = `/sites/${ context.params.site }`;

	dispatch( waitForPrefs() ).finally( () => {
		if ( hasDashboardOptIn( getState() ) ) {
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

	const queryParams = new URLSearchParams( window.location.search );
	const sshMigration = [ 'completed', 'failed' ].includes(
		queryParams.get( 'ssh-migration' ) ?? ''
	);
	if ( isMigrationInProgress( site ) || sshMigration ) {
		// Temporarily show the v1 site migration overview page.
		// @todo implement the page in v2.
		return overview( context, next );
	}

	if ( ! isEnabled( 'dashboard/v2/backport/site-overview' ) ) {
		return overview( context, next );
	}

	// Route doesn't require a <PageViewTracker /> because the dashboard
	// fires its own page view events.
	context.primary = <DashboardBackportSiteOverview siteSlug={ siteSlug } />;

	next();
}
