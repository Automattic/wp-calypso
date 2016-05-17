/**
 * External Dependencies
 */
import React from 'react';
import { Provider as ReduxProvider } from 'react-redux';
import omit from 'lodash/omit';
import debugFactory from 'debug';
import startsWith from 'lodash/startsWith';

/**
 * Internal Dependencies
 */
import ThemeSheetComponent from './main';
import ThemeDetailsComponent from 'components/data/theme-details';
import i18n from 'lib/mixins/i18n';
import { getCurrentUser } from 'state/current-user/selectors';
import { getThemeDetails } from 'state/themes/theme-details/selectors';
import ClientSideEffects from 'components/client-side-effects';
import { receiveThemeDetails, setBackPath } from 'state/themes/actions';
import wpcom from 'lib/wp';
import config from 'config';
import { decodeEntities } from 'lib/formatting';

const debug = debugFactory( 'calypso:themes' );
let themeDetailsCache = new Map();

export function makeElement( ThemesComponent, Head, store, props ) {
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
}

export function fetchThemeDetailsData( context, next ) {
	if ( ! config.isEnabled( 'manage/themes/details' ) || ! context.isServerSide ) {
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

export function details( context, next ) {
	const { slug } = context.params;
	const user = getCurrentUser( context.store.getState() );
	const themeName = ( getThemeDetails( context.store.getState(), slug ) || false ).name;
	const title = i18n.translate( '%(themeName)s Theme', {
		args: { themeName }
	} );
	const Head = user
		? require( 'layout/head' )
		: require( 'my-sites/themes/head' );

	const props = {
		themeSlug: slug,
		contentSection: context.params.section,
		title: decodeEntities( title ) + ' — WordPress.com', // TODO: Use lib/screen-title's buildTitle. Cf. https://github.com/Automattic/wp-calypso/issues/3796
		isLoggedIn: !! user
	};

	if ( context.prevPath && startsWith( context.prevPath, '/design' ) ) {
		context.store.dispatch( setBackPath( context.prevPath ) );
	}

	const ConnectedComponent = ( { themeSlug, contentSection, isLoggedIn } ) => (
		<ThemeDetailsComponent id={ themeSlug } >
			<ThemeSheetComponent section={ contentSection } isLoggedIn={ isLoggedIn } />
		</ThemeDetailsComponent>
	);

	context.primary = makeElement( ConnectedComponent, Head, context.store, props );
	context.secondary = null; // When we're logged in, we need to remove the sidebar.
	next();
}
