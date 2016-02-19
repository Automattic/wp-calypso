/**
 * External Dependencies
 */
import React from 'react';
import { Provider as ReduxProvider } from 'react-redux';
import debugFactory from 'debug';

/**
 * Internal Dependencies
 */
import ThemeSheetComponent from 'my-sites/themes/sheet';
import ThemeDetailsComponent from 'components/data/theme-details';
import i18n from 'lib/mixins/i18n';
import { getCurrentUser } from 'state/current-user/selectors';
import { getThemeDetails } from 'state/themes/theme-details/selectors';
import ClientSideEffects from 'components/client-side-effects';
import { receiveThemeDetails } from 'state/themes/actions';
import wpcom from 'lib/wp';
import config from 'config';
import { decodeEntities } from 'lib/formatting';
import ThemesHead from 'layout/head';
import analytics from 'lib/analytics';
import { getAnalyticsData } from '../helpers';

const debug = debugFactory( 'calypso:themes' );
let themeDetailsCache = new Map();

// This is generic -- nothing themes-specific in here!
export function makeElement( Component, getProps, Head, sideEffects = function() {} ) {
	return ( context, next ) => {
		const boundSideEffects = sideEffects.bind( null, context );

		context.primary = <ReduxProvider store={ context.store }>
			<Head context={ context }>
				<Component { ...getProps( context ) } />
				<ClientSideEffects>
					{ boundSideEffects }
				</ClientSideEffects>
			</Head>
		</ReduxProvider>;
		next();
	};
}

function runClientAnalytics( context ) {
	const { tier, site_id: siteId } = context.params;
	const { basePath, analyticsPageTitle } = getAnalyticsData(
		context.path,
		tier,
		siteId
	);
	analytics.pageView.record( basePath, analyticsPageTitle );
}

export const LoggedOutHead = ( { children, context: { store, params: { slug } } } ) => {
	const themeName = ( getThemeDetails( store.getState(), slug ) || false ).name;
	const title = i18n.translate( '%(themeName)s Theme', {
		args: { themeName }
	} );

	return (
		<ThemesHead title={ decodeEntities( title ) + ' — WordPress.com' }>
			{ children }
		</ThemesHead>
	);
}; // TODO: Use lib/screen-title's buildTitle. Cf. https://github.com/Automattic/wp-calypso/issues/3796

export function fetchThemeDetailsData( context, next ) {
	if ( ! config.isEnabled( 'manage/themes/details' ) ) {
		return next();
	}

	const themeSlug = context.params.slug;
	const theme = themeDetailsCache.get( themeSlug );

	if ( theme ) {
		debug( 'found theme!', theme.id );
		context.store.dispatch( receiveThemeDetails( theme ) );
		next();
	}

	themeSlug && wpcom.undocumented().themeDetails( themeSlug, ( error, data ) => {
		if ( error ) {
			debug( `Error fetching theme ${ themeSlug } details: `, error.message || error );
			return;
		}
		const themeData = themeDetailsCache.get( themeSlug );
		if ( ! themeData || ( Date( data.date_updated ) > Date( themeData.date_updated ) ) ) {
			debug( 'caching', themeSlug );
			themeDetailsCache.set( themeSlug, data );
			context.store.dispatch( receiveThemeDetails( data ) );
			next();
		}
	} );
} // TODO(ehg): We don't want to hit the endpoint for every req. Debounce based on theme arg?

function getDetailsProps( context ) {
	const { slug, section } = context.params;
	const user = getCurrentUser( context.store.getState() );

	return {
		themeSlug: slug,
		contentSection: section,
		isLoggedIn: !! user
	};
}

const ConnectedComponent = ( { themeSlug, contentSection } ) => (
	<ThemeDetailsComponent id={ themeSlug } >
		<ThemeSheetComponent section={ contentSection } />
	</ThemeDetailsComponent>
);

export const details = makeElement(
	ConnectedComponent,
	getDetailsProps,
	LoggedOutHead, // TODO: logged-in ? LoggedInHead : LoggedOutHead
	runClientAnalytics
);
// context.secondary = null; // FIXME!!!!
