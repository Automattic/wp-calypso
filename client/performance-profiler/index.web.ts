import page from '@automattic/calypso-router';
import { getLanguageRouteParam } from '@automattic/i18n-utils';
import { makeLayout, render as clientRender } from 'calypso/controller/index.web';
import { PerformanceProfilerDashboardContext, notFound } from './controller';

export default function () {
	const lang = getLanguageRouteParam();

	page(
		`/${ lang }/speed-test-tool/`,
		PerformanceProfilerDashboardContext,
		makeLayout,
		clientRender
	);
	page( `/${ lang }/speed-test-tool*`, notFound, makeLayout, clientRender );
}
