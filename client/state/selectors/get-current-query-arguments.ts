/**
 * Internal dependencies
 */
import { CalypsoState } from 'types';

/**
 * Gets the last query parameters set by a ROUTE_SET action
 * @param  state global redux state
 * @return       current state value
 */
export const getCurrentQueryArguments = ( state: CalypsoState ) => state.ui.route.query.current;

export default getCurrentQueryArguments;
