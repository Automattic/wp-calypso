/**
 * Internal dependencies
 */
import 'calypso/state/ui/init';

export function isSharePanelOpen( state, postGlobalId ) {
	if ( ! postGlobalId ) {
		// Avoid returning `true` if an invalid post ID is passed.
		return false;
	}
	return state.ui.postTypeList.postIdWithActiveSharePanel === postGlobalId;
}
