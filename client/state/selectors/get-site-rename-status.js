/**
 * External dependencies
 */
import { get } from 'lodash';

/**
 * @param { Object } state 	Global app state
 * @param { Number } siteId site ID
 * @returns { Object } An object that represents the current status for site rename requests.
 */
export default ( state, siteId ) => get( state, [ 'siteAddressChange', 'status', siteId ], {} );
