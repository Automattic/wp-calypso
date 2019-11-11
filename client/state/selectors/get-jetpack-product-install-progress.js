/**
 * External dependencies
 */
import { get } from 'lodash';

/**
 * @param {Object} state  Global app state.
 * @param {Number} siteId ID of the site to get Jetpack product install status of.
 * @return {?Number} Jetpack product installation progress (0 to 100), `null` if not started or no info yet.
 */
export default ( state, siteId ) =>
	get( state, [ 'jetpackProductInstall', siteId, 'progress' ], null );
