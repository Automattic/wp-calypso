/**
 * Internal dependencies
 */
import { setTitle as legacySetTitle } from './actions';

/**
 * Given a Redux store instance, subscribes to the store, updating the page
 * when the title state changes. Currently, this dispatches through the legacy
 * Flux actions used elsewhere in the codebase.
 *
 * @param {Object} store Redux store instance
 */
export function subscribeToStore( store ) {
	let title = store.getState().page.title;
	let count = store.getState().page.unreadCount;

	store.subscribe( () => {
		let nextTitle = store.getState().page.title;
		let nextCount = store.getState().page.unreadCount;

		if ( nextTitle !== title || nextCount !== count ) {
			title = nextTitle;
			count = nextCount;

			legacySetTitle( title, { count: count } );
		}
	} );
}
