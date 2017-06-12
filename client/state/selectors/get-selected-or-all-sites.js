/**
 * Internal dependencies
 */
import { getSites } from 'state/selectors';
import { getSelectedSite } from 'state/ui/selectors';

export default function getSelectedOrAllSites( state ) {
	const selectedSite = getSelectedSite( state );
	return selectedSite
		? [ selectedSite ]
		: getSites( state );
}
