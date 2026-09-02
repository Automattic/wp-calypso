import { pickBy } from '@automattic/js-utils';
import { createSelector } from '@automattic/state-utils';

import 'calypso/state/reader/init';

/**
 * Returns a list of site IDs blocked by the user
 * @param  {Object}  state  Global state tree
 * @returns {Array}        Blocked site IDs
 */
export default createSelector(
	( state ) => Object.keys( pickBy( state.reader.siteBlocks.items ) ).map( Number ),
	( state ) => [ state.reader.siteBlocks.items ]
);
