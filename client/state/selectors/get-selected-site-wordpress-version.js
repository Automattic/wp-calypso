/** @format */

/**
 * External dependencies
 */
import { get } from 'lodash';

/**
 * Internal dependencies
 */
import { getSelectedSite } from 'state/ui/selectors';

/**
 * Returns WordPress version of currently selected site.
 *
 * @param  {Object}  state  Global state tree
 * @return {String}         WordPress version of selected site
 */
export default function getSelectedSiteWordPressVersion( state ) {
	const selectedSite = getSelectedSite( state );
	return get( selectedSite, 'options.software_version' );
}
