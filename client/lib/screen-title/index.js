/**
 * External dependencies
 */
import includes from 'lodash/includes';

/**
 * Internal dependencies
 */
import { DOCUMENT_HEAD_TITLE_SET, DOCUMENT_HEAD_UNREAD_COUNT_SET } from 'state/action-types';
import { setTitle as legacySetTitle } from './actions';
import { getSelectedSiteId } from 'state/ui/selectors';

/**
 * Constants
 */
const TITLE_UPDATING_ACTIONS = [
	DOCUMENT_HEAD_TITLE_SET,
	DOCUMENT_HEAD_UNREAD_COUNT_SET
];

/**
 * Given a Redux store instance, subscribes to the store, updating the page
 * when the title state changes. Currently, this dispatches through the legacy
 * Flux actions used elsewhere in the codebase.
 *
 * @param {Object} store Redux store instance
 */
export function subscribeToStore( store ) {
	const dispatch = store.dispatch;
	store.dispatch = function( action ) {
		dispatch( ...arguments );

		if ( action && includes( TITLE_UPDATING_ACTIONS, action.type ) ) {
			const state = store.getState();
			const { title, unreadCount } = state.documentHead;
			const siteId = getSelectedSiteId( state );

			legacySetTitle( title, {
				siteID: siteId,
				count: unreadCount
			} );
		}
	};
}
