import { getAnyLanguageRouteParam } from '@automattic/i18n-utils/';
import {
	clientRouter,
	makeLayout,
	render as clientRender,
	setLocaleMiddleware,
} from 'calypso/controller/index.web';
import {
	siteProfilerContext,
	featureFlagFirewall,
	handleDomainQueryParam,
	redirectToBaseSiteProfilerRoute,
	siteProfilerReportContext,
} from 'calypso/site-profiler/controller';

export default function ( router: typeof clientRouter ) {
	const lang = getAnyLanguageRouteParam();
	const langSiteProfilerMiddleware = [
		featureFlagFirewall,
		setLocaleMiddleware(),
		redirectToBaseSiteProfilerRoute,
	];

	const siteProfilerMiddleware = [
		featureFlagFirewall,
		handleDomainQueryParam,
		siteProfilerContext,
		makeLayout,
		clientRender,
	];

	const siteProfilerReportMiddleware = [
		featureFlagFirewall,
		siteProfilerReportContext,
		makeLayout,
		clientRender,
	];

	router( '/site-profiler/report/:hash/:domain', ...siteProfilerReportMiddleware );
	router( '/site-profiler/report/:hash/:domain/*', ...siteProfilerReportMiddleware );

	router( `/site-profiler/${ lang }/:domain?`, ...langSiteProfilerMiddleware );
	router( `/${ lang }/site-profiler/:domain?`, ...langSiteProfilerMiddleware );

	router( '/site-profiler', ...siteProfilerMiddleware );
	router( '/site-profiler/:domain', ...siteProfilerMiddleware );
	router( '/site-profiler/:domain/*', ...siteProfilerMiddleware );
}
