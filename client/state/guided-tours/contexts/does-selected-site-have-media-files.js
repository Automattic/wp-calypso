/**
 * Internal dependencies
 */
import MediaStore from 'lib/media/store';
import { getSelectedSiteId } from 'state/ui/selectors';

const { getAll: getAllMedia } = MediaStore;

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
	const media = getAllMedia( siteId );
	return media && media.length && media.length > 0;
};
