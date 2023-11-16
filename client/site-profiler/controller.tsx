import config from '@automattic/calypso-config';
import { UniversalNavbarFooter } from '@automattic/wpcom-template-parts';
import page, { type Callback } from 'page';
import { ChangeEvent } from 'react';
import Main from 'calypso/components/main';
import SiteProfiler from 'calypso/site-profiler/components/site-profiler';
import { isUserLoggedIn } from 'calypso/state/current-user/selectors';

export const featureFlagFirewall: Callback = ( _context, next ) => {
	if ( config.isEnabled( 'site-profiler' ) ) {
		next();
	} else {
		page.redirect( '/' );
	}
};

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

	const onLanguageChange = ( e: ChangeEvent< HTMLSelectElement > ) => {
		page( `/${ e.target.value + pathName }` );
		window.location.reload();
	};

	context.primary = (
		<>
			<Main fullWidthLayout>
				<SiteProfiler routerDomain={ routerDomain } />
			</Main>
			<UniversalNavbarFooter isLoggedIn={ isLoggedIn } onLanguageChange={ onLanguageChange } />
		</>
	);

	next();
};
