/**
 * External dependencies
 */
import { get } from 'lodash';

/**
 * External dependencies
 */
import { getJetpackSettingsSaveRequestStatus } from 'state/selectors';

/**
 * Returns true fi the save Jetpack site settings requests is successful
 *
 * @param  {Object}  state  Global state tree
 * @param  {Number}  siteId Site ID
 * @return {Boolean}         Whether the requests is successful or not
 */
export function isJetpackSettingsSaveSuccessful( state, siteId ) {
	return getJetpackSettingsSaveRequestStatus( state, siteId ) === 'success';
}

/**
 * Returns the error returned by the last Jetpack site settings save request
 *
 * @param  {Object}  state  Global state tree
 * @param  {Number}  siteId Site ID
 * @return {String}         The request error
 */
export function getJetpackSettingsSaveError( state, siteId ) {
	return get( state.jetpack.settings.saveRequests, [ siteId, 'error' ], false );
}
