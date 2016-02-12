/**
 * External Dependencies
 */
import React from 'react';
import { Provider as ReduxProvider } from 'react-redux';
import omit from 'lodash/omit';

/**
 * Internal Dependencies
 */
import SingleSiteComponent from 'my-sites/themes/single-site';
import MultiSiteComponent from 'my-sites/themes/multi-site';
import LoggedOutComponent from 'my-sites/themes/logged-out';
import { ThemeSheet as ThemeSheetComponent } from 'my-sites/themes/sheet';
import ThemeDetailsComponent from 'components/data/theme-details';
import analytics from 'analytics';
import i18n from 'lib/mixins/i18n';
import trackScrollPage from 'lib/track-scroll-page';
import buildTitle from 'lib/screen-title/utils';
import { getAnalyticsData } from './helpers';
import { getCurrentUser } from 'state/current-user/selectors';
import { setSection } from 'state/ui/actions';
import ClientSideEffects from 'components/client-side-effects';
import LayoutLoggedOut from 'layout/logged-out';

function getProps( context ) {
	const { tier, site_id: siteId } = context.params;

	const title = buildTitle(
		i18n.translate( 'Themes', { textOnly: true } ),
		{ siteID: siteId } );

	const { basePath, analyticsPageTitle } = getAnalyticsData(
		context.path,
		tier,
		siteId
	);

	const runClientAnalytics = function() {
		analytics.pageView.record( basePath, analyticsPageTitle );
	};

	const boundTrackScrollPage = function() {
		trackScrollPage(
			basePath,
			analyticsPageTitle,
			'Themes'
		);
	};

	return {
		title,
		tier,
		search: context.query.s,
		trackScrollPage: boundTrackScrollPage,
		runClientAnalytics
	};
}

function makeElement( ThemesComponent, Head, store, props ) {
	return(
		<ReduxProvider store={ store }>
			<Head title={ props.title } tier={ props.tier || 'all' }>
				<ThemesComponent { ...omit( props, [ 'title', 'runClientAnalytics' ] ) } />
				<ClientSideEffects>
					{ props.runClientAnalytics }
				</ClientSideEffects>
			</Head>
		</ReduxProvider>
	);
};

// Where do we put this? It's client/server-agnostic, so not in client/controller,
// which requires ReactDom... Maybe in lib/react-helpers?
export function makeLoggedOutLayout( context, next ) {
	const { store, primary, secondary, tertiary } = context;
	context.layout = (
		<ReduxProvider store={ store }>
			<LayoutLoggedOut primary={ primary }
				secondary={ secondary }
				tertiary={ tertiary } />
		</ReduxProvider>
	);
	next();
};

export function singleSite( context, next ) {
	const Head = require( 'layout/head' );
	const { site_id: siteId } = context.params;
	const props = getProps( context );

	props.key = siteId;
	props.siteId = siteId;

	context.store.dispatch( setSection( 'design', {
		hasSidebar: true,
		isFullScreen: false
	} ) );

	context.primary = makeElement( SingleSiteComponent, Head, context.store, props );
	next();
}

export function multiSite( context, next ) {
	const Head = require( 'layout/head' );
	const props = getProps( context );

	context.store.dispatch( setSection( 'design', {
		hasSidebar: true,
		isFullScreen: false
	} ) );

	context.primary = makeElement( MultiSiteComponent, Head, context.store, props );
	next();
}

export function loggedOut( context, next ) {
	const Head = require( 'my-sites/themes/head' );
	const props = getProps( context );

	context.store.dispatch( setSection( 'design', {
		hasSidebar: false,
		isFullScreen: false
	} ) );

	context.primary = makeElement( LoggedOutComponent, Head, context.store, props );
	next();
}

export function details( context, next ) {
	const user = getCurrentUser( context.store.getState() );
	const Head = user
		? require( 'layout/head' )
		: require( 'my-sites/themes/head' );
	const props = {
		themeSlug: context.params.slug,
		contentSection: context.params.section,
		title: buildTitle(
			i18n.translate( 'Theme Details', { textOnly: true } )
		),
		isLoggedIn: !! user
	};

	context.store.dispatch( setSection( 'themes', {
		hasSidebar: false,
		isFullScreen: true
	} ) );

	context.secondary = null; // When we're logged in, we need to remove the sidebar.
	//TODO: use makeElement()
	context.primary = (
		<ReduxProvider store={ context.store } >
			<Head title={ props.title } isSheet>
				<ThemeDetailsComponent id={ props.themeSlug } section={ props.contentSection } >
					<ThemeSheetComponent />
				</ThemeDetailsComponent>
			</Head>
		</ReduxProvider>
	);
	next();
}
