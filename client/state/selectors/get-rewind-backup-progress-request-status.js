/**
 * External dependencies
 */
import { get } from 'lodash';

/**
 * Internal dependencies
 */
import getRequest from 'state/selectors/get-request';
import { getRewindBackupProgress } from 'state/activity-log/actions';

/**
 * Returns the status of the request for backup progress
 *
 * @param  {object}  state     Global state tree
 * @param  {?number}  siteId    Site ID
 * @returns {?string}            The request status (pending, success or error)
 */
export default function getRewindBackupProgressRequestStatus( state, siteId ) {
	return get( getRequest( state, getRewindBackupProgress( siteId ) ), 'status', null );
}
