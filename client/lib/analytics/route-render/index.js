import { recordTracksEvent } from 'calypso/lib/analytics/tracks';

export const ROUTE_RENDER_EVENT = 'calypso_route_render';

let lastContext = null;

/**
 * Records that a route rendered, keyed by the matched route pattern.
 *
 * This is a temporary audit event: it fires from the shared render layer so it can be compared
 * against `calypso_page_view`, which each view opts into individually. A context that renders
 * more than once (for example a handler that re-renders while it loads) is counted once.
 * @param {Object} context - Router context of the rendered route
 */
export function recordRouteRender( context ) {
	if ( ! context || context === lastContext ) {
		return;
	}
	lastContext = context;

	const { routePath, pathname, section } = context;

	recordTracksEvent( ROUTE_RENDER_EVENT, {
		app: 'calypso',
		path: typeof routePath === 'string' ? routePath : pathname,
		pathname,
		section: section?.name,
	} );
}
