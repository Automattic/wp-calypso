import { getAnyLanguageRouteParam } from '@automattic/i18n-utils';
import AsyncLoad from 'calypso/components/async-load';
import {
	makeLayout,
	redirectInvalidLanguage,
	redirectWithoutLocaleParamInFrontIfLoggedIn,
	redirectLoggedOutToSignup,
	render as clientRender,
} from 'calypso/controller';
import { setLocaleMiddleware } from 'calypso/controller/shared';
import { sectionify } from 'calypso/lib/route';
import { sidebar, setBeforePrimary } from 'calypso/reader/controller';
import {
	trackPageLoad,
	trackUpdatesLoaded,
	trackScrollPage,
} from 'calypso/reader/controller-helper';
import { recordTrack } from 'calypso/reader/stats';
import { isUserLoggedIn } from 'calypso/state/current-user/selectors';
import getCurrentQueryArguments from 'calypso/state/selectors/get-current-query-arguments';
import getCurrentRoute from 'calypso/state/selectors/get-current-route';
import renderHeaderSection from '../lib/header-section';
import { DiscoverDocumentHead } from './discover-document-head';
import { getDefaultTab } from './helper';
import { getPrivateRoutes, getDiscoverRoutes, getCurrentTab } from './routes';

const ANALYTICS_PAGE_TITLE = 'Reader';

const discover = ( context, next ) => {
	const basePath = sectionify( context.path );
	const fullAnalyticsPageTitle = ANALYTICS_PAGE_TITLE + ' > Discover';
	const streamKey = 'discover:recommended';
	const mcKey = 'discover';
	const state = context.store.getState();
	const currentRoute = getCurrentRoute( state );
	const currentQueryArgs = new URLSearchParams( getCurrentQueryArguments( state ) ).toString();
	const selectedTab = getCurrentTab( context.path, getDefaultTab() );

	trackPageLoad( basePath, fullAnalyticsPageTitle, mcKey );
	recordTrack(
		'calypso_reader_discover_viewed',
		{ content: selectedTab },
		{ pathnameOverride: `${ currentRoute }?${ currentQueryArgs }` }
	);

	if ( ! isUserLoggedIn( state ) ) {
		context.renderHeaderSection = renderHeaderSection;
	}

	context.primary = (
		<>
			<DiscoverDocumentHead />
			<AsyncLoad
				require="calypso/reader/discover/discover-stream"
				key="discover-page"
				streamKey={ streamKey }
				title="Discover"
				trackScrollPage={ trackScrollPage.bind(
					null,
					basePath,
					fullAnalyticsPageTitle,
					ANALYTICS_PAGE_TITLE,
					mcKey
				) }
				onUpdatesShown={ trackUpdatesLoaded.bind( null, mcKey ) }
				suppressSiteNameLink
				isDiscoverStream
				useCompactCards
				className="is-discover-stream"
				selectedTab={ selectedTab }
				query={ context.query }
			/>
		</>
	);
	next();
};

export default function ( router ) {
	const anyLangParam = getAnyLanguageRouteParam();

	const commonMiddleware = [
		redirectInvalidLanguage,
		redirectWithoutLocaleParamInFrontIfLoggedIn,
		setLocaleMiddleware(),
		setBeforePrimary,
		sidebar,
		discover,
		makeLayout,
		clientRender,
	];

	// Must be logged in to access.
	router( getPrivateRoutes( anyLangParam ), redirectLoggedOutToSignup, ...commonMiddleware );

	//
	router( getDiscoverRoutes( anyLangParam ), ...commonMiddleware );
}
