/**
 * External dependencies
 */
import { get, values } from 'lodash';

/**
 * Internal dependencies
 */
import getSitesItems from 'state/selectors/get-sites-items';

/**
 * Get a list of user's wp for teams sites, TODO: treeSelect it
 *
 * @param state redux state
 *
 * @returns [] list of site items
 */
export default function getSitesWPForTeams( state ) {
	const sites = getSitesItems( state );
	return values( sites ).filter( ( item ) =>
		get( item, [ 'options', 'is_wpforteams_site' ], false )
	);
}
