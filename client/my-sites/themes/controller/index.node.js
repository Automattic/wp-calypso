/**
 * External Dependencies
 */
import React from 'react';
import { Provider as ReduxProvider } from 'react-redux';
import omit from 'lodash/omit';
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
import { fetchThemeDetails } from 'state/themes/actions';
import config from 'config';
import { decodeEntities } from 'lib/formatting';

const debug = debugFactory( 'calypso:themes' );

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
};

export function fetchThemeDetailsData( context, next ) {
	if ( ! config.isEnabled( 'manage/themes/details' ) ) {
		return next();
	}

	const themeSlug = context.params.slug;
	const theme = getThemeDetails( context.store.getState(), themeSlug );

	if ( Object.keys( theme ).length ) {
		debug( 'found theme!', theme.id );
		next();
	} else if ( themeSlug ) {
		context.store.dispatch( fetchThemeDetails( themeSlug, next ) );
	}
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

	const ConnectedComponent = ( { themeSlug, contentSection } ) => (
		<ThemeDetailsComponent id={ themeSlug } >
			<ThemeSheetComponent section={ contentSection } />
		</ThemeDetailsComponent>
	);

	context.primary = makeElement( ConnectedComponent, Head, context.store, props );
	context.secondary = null; // When we're logged in, we need to remove the sidebar.
	next();
}
