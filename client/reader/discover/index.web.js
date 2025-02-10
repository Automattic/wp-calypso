import config from '@automattic/calypso-config';
import { getAnyLanguageRouteParam } from '@automattic/i18n-utils';
import AsyncLoad from 'calypso/components/async-load';
import {
	makeLayout,
	redirectInvalidLanguage,
	redirectWithoutLocaleParamInFrontIfLoggedIn,
	render as clientRender,
} from 'calypso/controller';
import { setLocaleMiddleware } from 'calypso/controller/shared';
import { sectionify } from 'calypso/lib/route';
import { sidebar, updateLastRoute } from 'calypso/reader/controller';
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
import { getSelectedTabTitle, DEFAULT_TAB } from './helper';

const ANALYTICS_PAGE_TITLE = 'Reader';

const discover = ( context, next ) => {
	const basePath = sectionify( context.path );
	const fullAnalyticsPageTitle = ANALYTICS_PAGE_TITLE + ' > Discover';
	const streamKey = 'discover:recommended';
	const mcKey = 'discover';
	const state = context.store.getState();

	const currentRoute = getCurrentRoute( state );
	const currentQueryArgs = new URLSearchParams( getCurrentQueryArguments( state ) ).toString();

	trackPageLoad( basePath, fullAnalyticsPageTitle, mcKey );
	recordTrack(
		'calypso_reader_discover_viewed',
		{},
		{ pathnameOverride: `${ currentRoute }?${ currentQueryArgs }` }
	);

	if ( ! isUserLoggedIn( state ) ) {
		context.renderHeaderSection = renderHeaderSection;
	}

	// Handle both old query parameter-based routing and new path-based routing
	let selectedTab = DEFAULT_TAB;
	if ( config.isEnabled( 'reader/discovery-v2' ) ) {
		// Extract the tab from the path for v2
		const pathParts = context.path.split( '/' );
		selectedTab = pathParts[ 2 ] || DEFAULT_TAB;
	} else {
		// Use query parameter for v1
		selectedTab = context.query.selectedTab || DEFAULT_TAB;
	}

	const tabTitle = getSelectedTabTitle( selectedTab );
	context.primary = (
		<>
			<DiscoverDocumentHead tabTitle={ tabTitle } />
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
				showBack={ false }
				className="is-discover-stream"
				selectedTab={ selectedTab }
			/>
		</>
	);
	next();
};

export default function ( router ) {
	const anyLangParam = getAnyLanguageRouteParam();

	if ( config.isEnabled( 'reader/discovery-v2' ) ) {
		// New path-based routes for v2
		router(
			[
				'/discover',
				'/discover/recommended',
				'/discover/add-new',
				'/discover/first-posts',
				'/discover/tags',
				'/discover/reddit',
				'/discover/latest',
				`/${ anyLangParam }/discover`,
				`/${ anyLangParam }/discover/recommended`,
				`/${ anyLangParam }/discover/add-new`,
				`/${ anyLangParam }/discover/first-posts`,
				`/${ anyLangParam }/discover/tags`,
				`/${ anyLangParam }/discover/reddit`,
				`/${ anyLangParam }/discover/latest`,
			],
			redirectInvalidLanguage,
			redirectWithoutLocaleParamInFrontIfLoggedIn,
			setLocaleMiddleware(),
			updateLastRoute,
			sidebar,
			discover,
			makeLayout,
			clientRender
		);
	} else {
		// Original query parameter-based route for v1
		router(
			[ '/discover', `/${ anyLangParam }/discover` ],
			redirectInvalidLanguage,
			redirectWithoutLocaleParamInFrontIfLoggedIn,
			setLocaleMiddleware(),
			updateLastRoute,
			sidebar,
			discover,
			makeLayout,
			clientRender
		);
	}
}
