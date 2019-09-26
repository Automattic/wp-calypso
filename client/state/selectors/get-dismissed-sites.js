/**
 * External dependencies
 */
import { map, pickBy } from 'lodash';
import createSelector from 'lib/create-selector';

/**
 * Returns a list of site IDs dismissed by the user
 *
 * @param  {Object}  state  Global state tree
 * @return {Array}        Dimissed site IDs
 */
export default createSelector(
	state => map( Object.keys( pickBy( state.reader.siteDismissals.items ) ), Number ),
	state => [ state.reader.siteDismissals.items ]
);
