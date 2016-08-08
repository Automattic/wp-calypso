/**
 * Internal dependencies
 */
import { DOCUMENT_HEAD_TITLE_SET, DOCUMENT_HEAD_UNREAD_COUNT_SET } from 'state/action-types';
import { setTitle as legacySetTitle, setCount as legacySetCount } from 'lib/screen-title/actions';
import { getSelectedSiteId } from 'state/ui/selectors';

/**
 * Middleware that updates the screen title when a title updating action is
 * dispatched. Currently, this dispatches through the legacy Flux actions used
 * elsewhere in the codebase.
 *
 * @param {Object} store Redux store instance
 * @returns {Function} A configured middleware with store
 */
export default ( { getState } ) => ( next ) => ( action ) => {
	switch ( action.type ) {
		case DOCUMENT_HEAD_TITLE_SET:
			legacySetTitle( action.title, { siteID: getSelectedSiteId( getState() ) } );
			break;

		case DOCUMENT_HEAD_UNREAD_COUNT_SET:
			legacySetCount( action.count, { siteID: getSelectedSiteId( getState() ) } );
			break;
	}

	return next( action );
};
