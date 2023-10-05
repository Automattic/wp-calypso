import config from '@automattic/calypso-config';
import { PureUniversalNavbarFooter } from '@automattic/wpcom-template-parts';
import page from 'page';
import { BrowserRouter } from 'react-router-dom';
import Main from 'calypso/components/main';
import SiteProfiler from 'calypso/site-profiler/components/site-profiler';
import { isUserLoggedIn } from 'calypso/state/current-user/selectors';

export function redirectSiteProfilerResult( context: PageJS.Context, next: () => void ) {
	const { querystring } = context;
	const queryParams = new URLSearchParams( querystring );
	const domainQueryParam = queryParams.get( 'domain' ) || '';

	if ( ! domainQueryParam ) {
		next();
	} else {
		page.redirect( `/site-profiler/${ domainQueryParam }` );
	}
}

export function siteProfilerContext( context: PageJS.Context, next: () => void ): void {
	const isLoggedIn = isUserLoggedIn( context.store.getState() );

	if ( ! config.isEnabled( 'site-profiler' ) ) {
		page.redirect( '/' );
		return;
	}

	context.primary = (
		<BrowserRouter>
			<Main fullWidthLayout>
				<SiteProfiler />
			</Main>
			{ isLoggedIn && <PureUniversalNavbarFooter isLoggedIn={ isLoggedIn } /> }
		</BrowserRouter>
	);

	next();
}
