import page from '@automattic/calypso-router';
import {
	A4A_REPORTS_LINK,
	A4A_REPORTS_OVERVIEW_LINK,
	A4A_REPORTS_DASHBOARD_LINK,
	A4A_REPORTS_BUILD_LINK,
} from 'calypso/a8c-for-agencies/components/sidebar-menu/lib/constants';
import { requireAccessContext } from 'calypso/a8c-for-agencies/controller';
import { makeLayout, render as clientRender } from 'calypso/controller';
import { reportsOverviewContext, reportsDashboardContext, buildReportContext } from './controller';

export default function () {
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
		buildReportContext,
		makeLayout,
		clientRender
	);
	page( A4A_REPORTS_LINK, () => page.redirect( A4A_REPORTS_OVERVIEW_LINK ) );

	// Keep this route but redirect to overview for any direct links
	page( `${ A4A_REPORTS_LINK }/build`, () => page.redirect( A4A_REPORTS_OVERVIEW_LINK ) );
}
