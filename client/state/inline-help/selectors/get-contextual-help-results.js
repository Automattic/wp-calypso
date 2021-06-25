/**
 * Internal Dependencies
 */
import { getSectionName } from 'calypso/state/ui/selectors';
import { getContextResults } from 'calypso/blocks/inline-help/contextual-help';

import 'calypso/state/inline-help/init';

/**
 * Returns an array of contextual results
 *
 * @param  {object}  state  Global state tree
 * @returns {Array}         List of contextual results based on route
 */
export default ( state ) => getContextResults( getSectionName( state ) );
