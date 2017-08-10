/** @format */
/**
 * Internal dependencies
 */
import { getSelectedSiteId } from 'state/ui/selectors';
import { getPrimarySiteId } from 'state/selectors';

/**
 * Returns the currently selected ID, or the primary Site ID, if none is selected.
 *
 * @param  {Object}  state Global state tree
 * @return {?Number}       The currently selected site ID, or the user's primary site's ID
 */
export default function getSelectedOrPrimarySiteId( state ) {
	const selectedSiteId = getSelectedSiteId( state );
	if ( selectedSiteId ) {
		return selectedSiteId;
	}

	return getPrimarySiteId( state );
}
