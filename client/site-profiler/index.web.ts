import page from 'page';
import { makeLayout, render as clientRender } from 'calypso/controller/index.web';
import { siteProfilerContext, redirectSiteProfilerResult } from 'calypso/site-profiler/controller';

export default function () {
	page(
		'/site-profiler',
		redirectSiteProfilerResult,
		siteProfilerContext,
		makeLayout,
		clientRender
	);
	page( '/site-profiler/:domain', siteProfilerContext, makeLayout, clientRender );
	page( '/site-profiler/:domain/*', siteProfilerContext, makeLayout, clientRender );
}
