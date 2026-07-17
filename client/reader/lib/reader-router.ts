import { createRouteRegistry, type Context, type RouteRegistry } from '@automattic/calypso-router';
import { makeLayout, notFound, render as clientRender } from 'calypso/controller';
import { composeHandlers } from 'calypso/controller/shared';
import { sidebar } from 'calypso/reader/controller';

const readerRoutes = createRouteRegistry();

/**
 * Drop-in wrapper over `page` for Reader controllers: registers the route(s) and
 * records them so `readerNotFound` can tell a real Reader path from a 404.
 *
 * Use it for Reader routes that live in a module OTHER than the one hosting the
 * catch-all (i.e. the `/reader/*` siblings, whose routes are appended after the base
 * `calypso/reader` catch-all). Routes that precede their own module's catch-all don't
 * need it, and pass-through wildcards must stay on plain `page` so they aren't recorded.
 */
export const readerPage: RouteRegistry[ 'page' ] = readerRoutes.page;

export function isKnownReaderRoute( path: string ): boolean {
	return readerRoutes.has( path );
}

const renderReaderNotFound = composeHandlers( sidebar, notFound, makeLayout, clientRender );

/**
 * Catch-all for unrecognized Reader paths: yields when a real Reader route owns the
 * path so dispatch reaches it; otherwise renders a 404 inside the Reader chrome.
 *
 * Register it with plain `page` (never `readerPage`) at each Reader top-level prefix,
 * after that section's own routes.
 */
export function readerNotFound( context: Context, next: () => void ): void {
	if ( isKnownReaderRoute( context.path ) ) {
		next();
		return;
	}
	renderReaderNotFound( context, next );
}
