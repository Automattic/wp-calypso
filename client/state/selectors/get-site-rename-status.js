/**
 * External dependencies
 */
import { get } from 'lodash';

/**
 * @param {object} state 	Global app state
 * @param {number} siteId site ID
 * @returns {object} An object that represents the current status for site rename requests.
 */
export default ( state, siteId ) => get( state, [ 'siteAddressChange', 'status', siteId ], {} );
