/**
 * Internal dependencies
 */
import { getSelectedSiteId } from 'calypso/state/ui/selectors';
import getAllMedia from 'calypso/state/selectors/get-media';

/**
 * Returns true if the selected site has any media files.
 *
 * @param {object} state Global state tree
 * @returns {boolean} True if site has any media files, false otherwise.
 */
export const doesSelectedSiteHaveMediaFiles = ( state ) => {
	const siteId = getSelectedSiteId( state );
	if ( ! siteId ) {
		return false;
	}
	const media = getAllMedia( state, siteId );
	return media && media.length && media.length > 0;
};
