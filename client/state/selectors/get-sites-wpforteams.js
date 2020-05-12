/**
 * External dependencies
 */
import { get, values } from 'lodash';

/**
 * Internal dependencies
 */
import getSitesItems from 'state/selectors/get-sites-items';

// TODO: treeSelect me
export default function getSitesWPForTeams( state ) {
	const sites = getSitesItems( state );
	return values( sites ).filter( ( item ) =>
		get( item, [ 'options', 'is_wpforteams_site' ], false )
	);
}
