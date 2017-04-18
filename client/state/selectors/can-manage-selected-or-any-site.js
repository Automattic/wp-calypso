/**
 * External dependencies
 */
import { get } from 'lodash';

/**
 * Internal dependencies
 */
import { getSelectedOrAllSites } from 'state/selectors';

export default function canManageSelectedOrAnySite( state ) {
	const sites = getSelectedOrAllSites( state );
	return sites.some( ( site ) =>
		get( site, 'capabilities.manage_options', false ) );
}
