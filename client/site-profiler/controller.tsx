import page, { type Callback } from '@automattic/calypso-router';
import { UniversalNavbarFooter } from '@automattic/wpcom-template-parts';
import Main from 'calypso/components/main';
import SiteProfiler from 'calypso/site-profiler/components/site-profiler';
import { isUserLoggedIn } from 'calypso/state/current-user/selectors';

export const handleDomainQueryParam: Callback = ( context, next ) => {
	const { querystring } = context;
	const queryParams = new URLSearchParams( querystring );
	const domainQueryParam = queryParams.get( 'domain' ) || '';

	if ( ! domainQueryParam ) {
		next();
	} else {
		page.redirect( `/site-profiler/${ domainQueryParam }` );
	}
};

export const redirectToBaseSiteProfilerRoute: Callback = ( context ) => {
	const { params, querystring } = context;

	if ( params?.domain ) {
		page.redirect( `/site-profiler/${ params.domain }` );
	} else if ( querystring ) {
		page.redirect( `/site-profiler?${ querystring }` );
	} else {
		page.redirect( '/site-profiler' );
	}
};

export const siteProfilerContext: Callback = ( context, next ) => {
	const isLoggedIn = isUserLoggedIn( context.store.getState() );
	const pathName = context.pathname || '';
	const routerDomain = pathName.split( '/site-profiler/' )[ 1 ]?.trim() || '';

	context.primary = (
		<>
			<Main fullWidthLayout>
				<SiteProfiler routerDomain={ routerDomain } />
			</Main>

			<UniversalNavbarFooter isLoggedIn={ isLoggedIn } />
		</>
	);

	next();
};

export const siteProfilerReportContext: Callback = ( context, next ) => {
	const isLoggedIn = isUserLoggedIn( context.store.getState() );
	const pathName = context.pathname || '';
	const routerParams = pathName.split( '/site-profiler/report/' )[ 1 ]?.trim() || '';
	const routerDomain = routerParams.split( '/' ).slice( 1 ).join( '/' );

	context.primary = (
		<>
			<Main fullWidthLayout>
				<SiteProfiler routerDomain={ routerDomain } hash={ context.params.hash } />
			</Main>

			<UniversalNavbarFooter isLoggedIn={ isLoggedIn } />
		</>
	);

	next();
};
