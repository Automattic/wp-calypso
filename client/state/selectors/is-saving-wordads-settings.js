/**
 * Internal dependencies
 */
import 'calypso/state/wordads/init';

/**
 * Returns true if we are saving the Wordads settings for the specified site ID, false otherwise.
 *
 * @param  {object}  state  Global state tree
 * @param  {number}  siteId Site ID
 * @returns {boolean}       Whether site's Wordads settings are being saved
 */
export default function isSavingWordadsSettings( state, siteId ) {
	return state.wordads.settings.requests[ siteId ] ?? false;
}
