/**
 * External dependencies
 */
import { map, pickBy } from 'lodash';
import createSelector from 'lib/create-selector';

/**
 * Internal dependencies
 */
import 'state/reader/reducer';

/**
 * Returns a list of site IDs dismissed by the user
 *
 * @param  {object}  state  Global state tree
 * @returns {Array}        Dimissed site IDs
 */
export default createSelector(
	state => map( Object.keys( pickBy( state.reader.siteDismissals.items ) ), Number ),
	state => [ state.reader.siteDismissals.items ]
);
