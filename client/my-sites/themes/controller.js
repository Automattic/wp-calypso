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
import analytics from 'analytics';
import i18n from 'lib/mixins/i18n';
import trackScrollPage from 'lib/track-scroll-page';
import buildTitle from 'lib/screen-title/utils';
import { getAnalyticsData } from './helpers';
import { getCurrentUser } from 'state/current-user/selectors';
import { setSection } from 'state/ui/actions';
import ClientSideEffects from 'components/client-side-effects';

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

	context.primary = makeElement( ThemeSheetComponent, Head, context.store, props );
	context.secondary = null; // When we're logged in, we need to remove the sidebar.
	next();
}
