import debugFactory from 'debug';
import { logServerEvent } from 'calypso/lib/analytics/statsd-utils';
import wpcom from 'calypso/lib/wp';
import performanceMark from 'calypso/server/lib/performance-mark';
import { THEME_FILTERS_ADD } from 'calypso/state/themes/action-types';
import { requestTheme, setBackPath } from 'calypso/state/themes/actions';
import { getTheme, getThemeFilters, getThemeRequestErrors } from 'calypso/state/themes/selectors';
import ThemeSheetComponent from './main';
import ThemeNotFoundError from './theme-not-found-error';

const debug = debugFactory( 'calypso:themes' );

export function fetchThemeDetailsData( context, next ) {
	if ( context.cachedMarkup ) {
		return next();
	}

	const themeSlug = context.params.slug;
	const theme = getTheme( context.store.getState(), 'wpcom', themeSlug );
	const themeDotOrg = getTheme( context.store.getState(), 'wporg', themeSlug );

	if ( theme || themeDotOrg ) {
		debug( 'found theme!', theme?.id ?? themeDotOrg.id );
		return next();
	}

	context.store
		.dispatch( requestTheme( themeSlug, 'wpcom', context.lang ) )
		.then( () => {
			const themeDetails = getTheme( context.store.getState(), 'wpcom', themeSlug );
			if ( themeDetails ) {
				return next();
			}

			context.store
				.dispatch( requestTheme( themeSlug, 'wporg', context.lang ) )
				.then( () => {
					const themeOrgDetails = getTheme( context.store.getState(), 'wporg', themeSlug );
					if ( ! themeOrgDetails ) {
						const err = {
							status: 404,
							message: 'Theme Not Found',
							themeSlug,
						};
						const error = getThemeRequestErrors( context.store.getState(), themeSlug, 'wporg' );
						debug( `Error fetching WPORG theme ${ themeSlug } details: `, error.message || error );
						return next( err );
					}

					next();
				} )
				.catch( next );

			const error = getThemeRequestErrors( context.store.getState(), themeSlug, 'wpcom' );
			debug( `Error fetching WPCOM theme ${ themeSlug } details: `, error.message || error );
		} )
		.catch( next );
}

export function fetchThemeFilters( context, next ) {
	if ( context.cachedMarkup ) {
		debug( 'Skipping theme filter data fetch' );
		return next();
	}
	performanceMark( context, 'fetchThemeFilters' );

	const { store } = context;
	const hasFilters = Object.keys( getThemeFilters( store.getState() ) ).length > 0;

	logServerEvent( 'themes', {
		name: `ssr.get_theme_filters_fetch_cache.${ hasFilters ? 'hit' : 'miss' }`,
		type: 'counting',
	} );

	if ( hasFilters ) {
		debug( 'found theme filters in cache' );
		return next();
	}

	wpcom.req
		.get( '/theme-filters', {
			apiVersion: '1.2',
			locale: context.lang, // Note: undefined will be omitted by the query string builder.
		} )
		.then( ( filters ) => {
			store.dispatch( { type: THEME_FILTERS_ADD, filters } );
			next();
		} )
		.catch( next );
}

export function details( context, next ) {
	const { slug, section } = context.params;
	if ( context.previousPath && context.previousPath.startsWith( '/themes' ) ) {
		context.store.dispatch( setBackPath( context.previousPath ) );
	}

	context.primary = (
		<ThemeSheetComponent
			id={ slug }
			section={ section }
			pathName={ context.pathname }
			syncActiveTheme={ context.query?.[ 'sync-active-theme' ] === 'true' }
		/>
	);

	next();
}

export function notFoundError( err, context, next ) {
	context.primary = <ThemeNotFoundError />;
	next( err );
}
