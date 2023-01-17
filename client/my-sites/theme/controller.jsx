import debugFactory from 'debug';
import { Provider as ReduxProvider } from 'react-redux';
import LayoutLoggedOut from 'calypso/layout/logged-out';
import { requestTheme, setBackPath } from 'calypso/state/themes/actions';
import { getTheme, getThemeRequestErrors } from 'calypso/state/themes/selectors';
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

export function details( context, next ) {
	const { slug, section } = context.params;
	if ( context.prevPath && context.prevPath.startsWith( '/themes' ) ) {
		context.store.dispatch( setBackPath( context.prevPath ) );
	}

	context.primary = (
		<ThemeSheetComponent id={ slug } section={ section } pathName={ context.pathname } />
	);

	next();
}

export function notFoundError( err, context, next ) {
	context.layout = (
		<ReduxProvider store={ context.store }>
			<LayoutLoggedOut primary={ <ThemeNotFoundError /> } />
		</ReduxProvider>
	);
	next( err );
}
