import 'calypso/state/ui/init';

/**
 * Returns the currently globally selected site ID.
 * @returns {?number}       Selected site ID
 */
export default function getGloballySelectedSiteId( state ) {
	return state.ui.globallySelectedSiteId;
}
