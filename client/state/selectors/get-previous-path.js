/**
 * External dependencies
 */
import { get } from 'lodash';

/**
 * Internal dependencies
 */
import 'calypso/state/route/init';

/**
 * Gets the previous path set by a ROUTE_SET action
 *
 * @param {object} state - global redux state
 * @returns {string} previous path value
 */
export const getPreviousPath = ( state ) => get( state, 'route.path.previous', '' );

export default getPreviousPath;
