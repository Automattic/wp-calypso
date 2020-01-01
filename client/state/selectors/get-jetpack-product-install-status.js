/**
 * External dependencies
 */
import { get } from 'lodash';

/**
 * @param {object} state  Global app state.
 * @param {number} siteId ID of the site to get Jetpack product install status of.
 * @return {?object} An object containing the current Jetpack product install status.
 */
export default ( state, siteId ) => get( state, [ 'jetpackProductInstall', siteId ], null );
