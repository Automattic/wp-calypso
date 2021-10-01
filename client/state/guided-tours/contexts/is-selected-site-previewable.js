import { isSitePreviewable } from 'calypso/state/sites/selectors';
import { getSelectedSiteId } from 'calypso/state/ui/selectors';

/**
 * Returns true if the selected site can be previewed
 *
 * @param {object} state Global state tree
 * @returns {boolean} True if selected site can be previewed, false otherwise.
 */
export const isSelectedSitePreviewable = ( state ) =>
	isSitePreviewable( state, getSelectedSiteId( state ) );
