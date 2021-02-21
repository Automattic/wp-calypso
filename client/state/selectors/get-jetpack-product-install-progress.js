/**
 * External dependencies
 */
import { get } from 'lodash';

/**
 * Internal dependencies
 */
import 'calypso/state/jetpack-product-install/init';

/**
 * @param {object} state  Global app state.
 * @param {number} siteId ID of the site to get Jetpack product install status of.
 * @returns {?number} Jetpack product installation progress (0 to 100), `null` if not started or no info yet.
 */
export default ( state, siteId ) =>
	get( state, [ 'jetpackProductInstall', siteId, 'progress' ], null );
