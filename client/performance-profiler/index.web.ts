import page from '@automattic/calypso-router';
import { getAnyLanguageRouteParam } from '@automattic/i18n-utils/';
import { makeLayout, render as clientRender } from 'calypso/controller/index.web';
import {
	PerformanceProfilerDashboardContext,
	WeeklyReportContext,
	notFound,
	WeeklyReportUnsubscribeContext,
} from './controller';

export default function () {
	const lang = getAnyLanguageRouteParam();

	page(
		`/${ lang }/speed-test-tool/`,
		PerformanceProfilerDashboardContext,
		makeLayout,
		clientRender
	);
	page( `/${ lang }/speed-test-tool/weekly-report`, WeeklyReportContext, makeLayout, clientRender );
	page(
		`/${ lang }/speed-test-tool/weekly-report/unsubscribe`,
		WeeklyReportUnsubscribeContext,
		makeLayout,
		clientRender
	);
	page( `/${ lang }/speed-test-tool*`, notFound, makeLayout, clientRender );

	page( '/speed-test-tool/', PerformanceProfilerDashboardContext, makeLayout, clientRender );
	page( '/speed-test-tool/weekly-report', WeeklyReportContext, makeLayout, clientRender );
	page(
		'/speed-test-tool/weekly-report/unsubscribe',
		WeeklyReportUnsubscribeContext,
		makeLayout,
		clientRender
	);
	page( '/speed-test-tool*', notFound, makeLayout, clientRender );
}
