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
	let { selectedSiteId, title } = store.getState().ui;
	store.subscribe( () => {
		const {
			selectedSiteId: nextSelectedSiteId,
			title: nextTitle
		} = store.getState().ui;

		if ( nextTitle !== title || nextSelectedSiteId !== selectedSiteId ) {
			title = nextTitle;
			selectedSiteId = nextSelectedSiteId;

			legacySetTitle( title, {
				siteID: selectedSiteId
			} );
		}
	} );
}
