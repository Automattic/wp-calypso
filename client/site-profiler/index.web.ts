import page from 'page';
import {
	makeLayout,
	render as clientRender,
	setLocaleMiddleware,
} from 'calypso/controller/index.web';
import {
	siteProfilerContext,
	redirectSiteProfilerResult,
	redirectSiteProfilerLanguage,
} from 'calypso/site-profiler/controller';

export default function () {
	page( '/:lang/site-profiler/:domain?', setLocaleMiddleware(), redirectSiteProfilerLanguage );

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
