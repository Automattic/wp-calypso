/**
 * External Dependencies
 */
import { flow } from 'lodash';

/**
 * Internal Dependencies
 */
import { getLastRouteAction } from 'state/ui/action-log/selectors';
import pathToSection from 'lib/path-to-section';
import { getContextResults } from 'blocks/inline-help/contextual-help';

import 'state/inline-help/init';

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
