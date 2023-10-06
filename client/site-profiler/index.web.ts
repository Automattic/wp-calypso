import page from 'page';
import {
	makeLayout,
	render as clientRender,
	setLocaleMiddleware,
} from 'calypso/controller/index.web';
import {
	siteProfilerContext,
	redirectToRoot,
	redirectSiteProfilerResult,
	redirectSiteProfilerLanguage,
} from 'calypso/site-profiler/controller';

export default function () {
	page(
		'/:lang/site-profiler/:domain?',
		redirectToRoot,
		setLocaleMiddleware(),
		redirectSiteProfilerLanguage
	);

	page(
		'/site-profiler',
		redirectToRoot,
		redirectSiteProfilerResult,
		siteProfilerContext,
		makeLayout,
		clientRender
	);
	page( '/site-profiler/:domain', redirectToRoot, siteProfilerContext, makeLayout, clientRender );
	page( '/site-profiler/:domain/*', redirectToRoot, siteProfilerContext, makeLayout, clientRender );
}
