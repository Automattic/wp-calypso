/** @format */

/**
 * Internal dependencies
 */

import { default as createSelector } from 'lib/create-selector';
import { getSites } from 'state/selectors';
import { getSelectedSite } from 'state/ui/selectors';

export default createSelector(
	state => {
		const selectedSite = getSelectedSite( state );
		return selectedSite ? [ selectedSite ] : getSites( state );
	},
	[ getSelectedSite, getSites ]
);
