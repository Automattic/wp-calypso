import page from '@automattic/calypso-router';
import { requireAccessContext } from 'calypso/a8c-for-agencies/controller';
import { makeLayout, render as clientRender } from 'calypso/controller';
import {
	A4A_REPORTS_LINK,
	A4A_REPORTS_OVERVIEW_LINK,
	A4A_REPORTS_DASHBOARD_LINK,
	A4A_REPORTS_BUILD_LINK,
} from './constants';
import {
	reportsLandingContext,
	reportsOverviewContext,
	reportsDashboardContext,
	reportsBuildContext,
} from './controller';

export default function () {
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
