/**
 * External dependencies
 */
import { get } from 'lodash';

/**
 * Returns the error returned by the last Jetpack site settings save request
 *
 * @param  {Object}  state  Global state tree
 * @param  {Number}  siteId Site ID
 * @return {String}         The request error
 */
export default function getJetpackSettingsSaveError( state, siteId ) {
	return get( state.jetpack.settings.saveRequests, [ siteId, 'error' ], false );
}
