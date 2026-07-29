import page from '@automattic/calypso-router';
import { requireAccessContext } from 'calypso/a8c-for-agencies/controller';
import redirectLegacyRoute from 'calypso/a8c-for-agencies/lib/redirect-legacy-route';
import { makeLayout, render as clientRender } from 'calypso/controller';
import {
	A4A_REPORTS_LINK,
	A4A_REPORTS_OVERVIEW_LINK,
	A4A_REPORTS_DASHBOARD_LINK,
	A4A_REPORTS_BUILD_LINK,
	A4A_REPORTS_LEGACY_LINK,
} from './constants';
import {
	reportsLandingContext,
	reportsOverviewContext,
	reportsDashboardContext,
	reportsBuildContext,
} from './controller';

/**
 * Reports lives under `/sites/reports`, so its routes have to be registered before the
 * `/sites/:category` catch-all in the sites section — page.js matches in registration
 * order. The sites section calls this; don't move it back into the default export.
 */
export function registerReportsRoutes() {
	page( A4A_REPORTS_LINK, requireAccessContext, reportsLandingContext, makeLayout, clientRender );
	page(
		A4A_REPORTS_OVERVIEW_LINK,
		requireAccessContext,
		reportsOverviewContext,
		makeLayout,
		clientRender
	);
	page(
		A4A_REPORTS_DASHBOARD_LINK,
		requireAccessContext,
		reportsDashboardContext,
		makeLayout,
		clientRender
	);
	page(
		A4A_REPORTS_BUILD_LINK,
		requireAccessContext,
		reportsBuildContext,
		makeLayout,
		clientRender
	);
}

export default function () {
	page( A4A_REPORTS_LEGACY_LINK, redirectLegacyRoute( A4A_REPORTS_LINK ) );
	page( `${ A4A_REPORTS_LEGACY_LINK }/overview`, redirectLegacyRoute( A4A_REPORTS_OVERVIEW_LINK ) );
	page(
		`${ A4A_REPORTS_LEGACY_LINK }/dashboard`,
		redirectLegacyRoute( A4A_REPORTS_DASHBOARD_LINK )
	);
	page( `${ A4A_REPORTS_LEGACY_LINK }/build`, redirectLegacyRoute( A4A_REPORTS_BUILD_LINK ) );
}
