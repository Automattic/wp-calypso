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
 * @returns {?object} An object containing the current Jetpack product install status.
 */
export default ( state, siteId ) => get( state, [ 'jetpackProductInstall', siteId ], null );
