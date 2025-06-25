import page from '@automattic/calypso-router';
import { getUrlParts } from '@automattic/calypso-url';
import { QueryClient } from '@tanstack/react-query';
import debugFactory from 'debug';
import { Store } from 'redux';

const debug = debugFactory( 'calypso' );

export const setupContextMiddleware = ( reduxStore: Store, reactQueryClient: QueryClient ) => {
	let previousPath: string | null = null;

	page( '*', ( context, next ) => {
		const parsed = getUrlParts( context.path );

		context.previousPath = previousPath;
		previousPath = context.path;

		context.query = Object.fromEntries( parsed.searchParams.entries() );
		context.pathname = parsed.pathname;

		context.hashstring = ( parsed.hash && parsed.hash.substring( 1 ) ) || '';
		// set `context.hash` (we have to parse manually)
		if ( context.hashstring ) {
			try {
				// `hash` is actually used as an object from lots of places.
				// Compiler complains Type '{ [k: string]: string; }' is not assignable to type 'string'.
				// eslint-disable-next-line @typescript-eslint/ban-ts-comment
				// @ts-ignore
				context.hash = Object.fromEntries(
					new globalThis.URLSearchParams( context.hashstring ).entries()
				);
			} catch ( e ) {
				debug( 'failed to query-string parse `location.hash`', e );
				// `hash` is actually used as an object from lots of places.
				// Compiler complains Type '{ [k: string]: string; }' is not assignable to type 'string'.
				// eslint-disable-next-line @typescript-eslint/ban-ts-comment
				// @ts-ignore
				context.hash = {};
			}
		} else {
			// `hash` is actually used as an object from lots of places.
			// Compiler complains Type '{ [k: string]: string; }' is not assignable to type 'string'.
			// eslint-disable-next-line @typescript-eslint/ban-ts-comment
			// @ts-ignore
			context.hash = {};
		}

		context.store = reduxStore;
		context.queryClient = reactQueryClient;

		// client version of the isomorphic method for redirecting to another page
		context.redirect = ( httpCode: number, newUrl: null | string | number = null ) => {
			if ( isNaN( httpCode ) && ! newUrl ) {
				newUrl = httpCode;
			}

			return page.replace( newUrl as string, context.state, false, false );
		};

		// Break routing and do full load for logout link in /me
		if ( context.pathname === '/wp-login.php' ) {
			window.location.href = context.path;
			return;
		}

		// Some paths live outside of Calypso and should be opened separately
		// Examples: /support, /forums
		// if ( isOutsideCalypso( context.pathname ) ) {
		// 	window.location.href = context.path;
		// 	return;
		// }

		next();
	} );

	page.exit( '*', ( context, next ) => {
		context.store = reduxStore;
		context.queryClient = reactQueryClient;

		next();
	} );
};
