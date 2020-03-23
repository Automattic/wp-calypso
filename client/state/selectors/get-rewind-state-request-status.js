/**
 * External dependencies
 */
import { get } from 'lodash';

/**
 * Internal dependencies
 */
import getRequest from 'state/selectors/get-request';
import { requestRewindState } from 'state/rewind/state/actions';

/**
 * Returns the status of the request for rewind state
 *
 * @param  {object}  state     Global state tree
 * @param  {number}  siteId    Site ID
 * @returns {string}            The request status (pending, success or error)
 */
export default function getRewindStateRequestStatus( state, siteId ) {
	return get( getRequest( state, requestRewindState( siteId ) ), 'status' );
}
