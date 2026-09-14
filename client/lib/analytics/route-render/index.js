import { recordTracksEvent } from 'calypso/lib/analytics/tracks';

export const ROUTE_RENDER_EVENT = 'calypso_route_render';
export const UNMATCHED_ROUTE = '(unmatched)';

let lastContext = null;

// Temporary audit event: remove after the comparison with calypso_page_view.
// Only the route pattern is recorded, never the concrete path, which can carry invitation keys.
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
