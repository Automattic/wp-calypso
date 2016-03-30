/**
 * Internal dependencies
 */
import { setTitle as legacySetTitle } from './actions';
import { getSelectedSiteId } from 'state/ui/selectors';

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
	let siteId = getSelectedSiteId( store.getState() );

	store.subscribe( () => {
		const state = store.getState();

		let nextTitle = state.page.title;
		let nextCount = state.page.unreadCount;
		let nextSiteId = getSelectedSiteId( state );

		if ( nextTitle !== title || nextCount !== count || nextSiteId !== siteId ) {
			title = nextTitle;
			count = nextCount;
			siteId = nextSiteId;

			legacySetTitle( title, { siteID: siteId, count: count } );
		}
	} );
}
