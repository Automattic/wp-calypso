import {
	clientRouter,
	makeLayout,
	render as clientRender,
	setLocaleMiddleware,
} from 'calypso/controller/index.web';
import {
	siteProfilerContext,
	featureFlagFirewall,
	redirectSiteProfilerResult,
	redirectSiteProfilerLanguage,
} from 'calypso/site-profiler/controller';

export default function ( router: typeof clientRouter ) {
	const siteProfilerMiddleware = [
		featureFlagFirewall,
		redirectSiteProfilerResult,
		siteProfilerContext,
		makeLayout,
		clientRender,
	];

	router(
		'/:lang/site-profiler/:domain?',
		featureFlagFirewall,
		setLocaleMiddleware(),
		redirectSiteProfilerLanguage
	);

	router( '/site-profiler', ...siteProfilerMiddleware );
	router( '/site-profiler/:domain', ...siteProfilerMiddleware );
	router( '/site-profiler/:domain/*', ...siteProfilerMiddleware );
}
