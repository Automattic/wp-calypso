import { getLanguageRouteParam } from '@automattic/i18n-utils';
import { clientRouter, makeLayout, render as clientRender } from 'calypso/controller/index.web';
import { PerformanceProfilerDashboardContext, WeeklyReportContext } from './controller';

export default function ( router: typeof clientRouter ) {
	const langParam = getLanguageRouteParam();
	router(
		`/${ langParam }/speed-test-tool/`,
		PerformanceProfilerDashboardContext,
		makeLayout,
		clientRender
	);
	router(
		`/${ langParam }/speed-test-tool/weekly-report`,
		WeeklyReportContext,
		makeLayout,
		clientRender
	);
	//router( `/${ langParam }/speed-test-tool*`, makeLayout, clientRender );
}
