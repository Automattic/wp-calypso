import { createSelector } from '@automattic/state-utils';
import { map, pickBy } from 'lodash';

import 'calypso/state/reader/init';

/**
 * Returns a list of site IDs blocked by the user
 *
 * @param  {Object}  state  Global state tree
 * @returns {Array}        Blocked site IDs
 */
export default createSelector(
	( state ) => map( Object.keys( pickBy( state.reader.siteBlocks.items ) ), Number ),
	( state ) => [ state.reader.siteBlocks.items ]
);
