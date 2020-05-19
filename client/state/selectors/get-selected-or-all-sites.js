/**
 * Internal dependencies
 */

import createSelector from 'lib/create-selector';
import getSites from 'state/selectors/get-sites';
import { getSelectedSite } from 'state/ui/selectors';

export default createSelector(
	( state ) => {
		const selectedSite = getSelectedSite( state );
		return selectedSite ? [ selectedSite ] : getSites( state );
	},
	[ getSelectedSite, getSites ]
);
