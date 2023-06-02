import getPrimarySiteId from 'calypso/state/selectors/get-primary-site-id';
import { getSelectedSiteId } from 'calypso/state/ui/selectors';

/**
 * Returns the currently selected ID, or the primary Site ID, if none is selected.
 *
 * @param  {Object}  state Global state tree
 * @returns {?number}       The currently selected site ID, or the user's primary site's ID
 */
export default function getSelectedOrPrimarySiteId( state ) {
	const selectedSiteId = getSelectedSiteId( state );
	if ( selectedSiteId ) {
		return selectedSiteId;
	}

	return getPrimarySiteId( state );
}
