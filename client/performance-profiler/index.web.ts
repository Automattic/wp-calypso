import page from '@automattic/calypso-router';
import { makeLayout, render as clientRender } from 'calypso/controller/index.web';
import { PerformanceProfilerDashboardContext, notFound } from './controller';

export default function () {
	page( '/speed-test-tool/:domain', PerformanceProfilerDashboardContext, makeLayout, clientRender );
	page(
		'/speed-test-tool/:domain/*',
		PerformanceProfilerDashboardContext,
		makeLayout,
		clientRender
	);
	page( '/speed-test-tool*', notFound, makeLayout, clientRender );
}
