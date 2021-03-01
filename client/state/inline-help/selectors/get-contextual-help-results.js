/**
 * External Dependencies
 */
import { flow } from 'lodash';

/**
 * Internal Dependencies
 */
import { getLastRouteAction } from 'calypso/state/ui/action-log/selectors';
import pathToSection from 'calypso/lib/path-to-section';
import { getContextResults } from 'calypso/blocks/inline-help/contextual-help';

import 'calypso/state/inline-help/init';

/**
 * Returns an array of contextual results
 *
 * @param  {object}  state  Global state tree
 * @returns {Array}         List of contextual results based on route
 */
export default flow(
	getLastRouteAction,
	( x ) => x.path,
	pathToSection,
	getContextResults,
	( x = [] ) => x
);
