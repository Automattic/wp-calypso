import page from '@automattic/calypso-router';
import { makeLayout, render as clientRender } from 'calypso/controller/index.web';
import {
	PerformanceProfilerDashboardContext,
	WeeklyReportContext,
	notFound,
	WeeklyReportUnsubscribeContext,
} from './controller';

export default function () {
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
