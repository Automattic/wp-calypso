/** @format */

/**
 * Internal dependencies
 */

import { getSites } from 'client/state/selectors';
import { getSelectedSite } from 'client/state/ui/selectors';

export default function getSelectedOrAllSites( state ) {
	const selectedSite = getSelectedSite( state );
	return selectedSite ? [ selectedSite ] : getSites( state );
}
