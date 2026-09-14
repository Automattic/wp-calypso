import { recordTracksEvent } from 'calypso/lib/analytics/tracks';

export const ROUTE_RENDER_EVENT = 'calypso_route_render';
export const UNMATCHED_ROUTE = '(unmatched)';

let lastContext = null;

/**
 * Records that a route rendered, keyed by the matched route pattern.
// Temporary audit event — remove after comparison with calypso_page_view.
 */
export function recordRouteRender( context ) {
	if ( ! context || context === lastContext ) {
		return;
	}
	lastContext = context;

	const { currentRoutePattern, section } = context;

	recordTracksEvent( ROUTE_RENDER_EVENT, {
		app: 'calypso',
		path: currentRoutePattern ?? UNMATCHED_ROUTE,
		section: section?.name,
	} );
}
