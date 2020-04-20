/**
 * External dependencies
 */
import { map, pickBy } from 'lodash';
import createSelector from 'lib/create-selector';

/**
 * Internal dependencies
 */
import 'state/reader/init';

/**
 * Returns a list of site IDs dismissed by the user
 *
 * @param  {object}  state  Global state tree
 * @returns {Array}        Dimissed site IDs
 */
export const getDismissedSites = createSelector(
	( state ) => map( Object.keys( pickBy( state.reader.siteDismissals.items ) ), Number ),
	( state ) => [ state.reader.siteDismissals.items ]
);
