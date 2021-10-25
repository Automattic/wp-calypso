import { createSelector } from '@automattic/state-utils';
import { getContextResults } from 'calypso/blocks/inline-help/contextual-help';
import { getSectionName } from 'calypso/state/ui/selectors';

import 'calypso/state/inline-help/init';

/**
 * Returns an array of contextual results
 *
 * @param  {object}  state  Global state tree
 * @returns {Array}         List of contextual results based on route
 */
export default createSelector(
	( state ) => getContextResults( getSectionName( state ) ),
	( state ) => getSectionName( state )
);
