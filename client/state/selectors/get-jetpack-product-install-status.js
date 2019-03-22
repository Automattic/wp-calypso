/**
 * External dependencies
 */
import { get } from 'lodash';

/**
 * @param {Object} state  Global app state.
 * @param {Number} siteId ID of the site to get Jetpack product install status of.
 * @return {Object} An object containing the current Jetpack product install status.
 */
export default ( state, siteId ) => get( state, [ 'jetpackProductInstall', siteId ], null );
