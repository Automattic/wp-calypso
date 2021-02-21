/**
 * Internal dependencies
 */
import { EDITOR_PASTE_EVENT } from 'calypso/state/action-types';
import { SOURCE_GOOGLE_DOCS } from 'calypso/components/tinymce/plugins/wpcom-track-paste/sources';
import { getLastAction } from 'calypso/state/ui/action-log/selectors';

/**
 * Returns true if user has just pasted something from Google Docs.
 *
 * @param {object} state Global state tree
 * @returns {boolean} True if user has just pasted something from Google Docs, false otherwise.
 */
export const hasUserPastedFromGoogleDocs = ( state ) => {
	const action = getLastAction( state ) || false;
	return action && action.type === EDITOR_PASTE_EVENT && action.source === SOURCE_GOOGLE_DOCS;
};
