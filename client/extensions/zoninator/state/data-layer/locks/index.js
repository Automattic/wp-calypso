/**
 * Internal dependencies
 */
import { http } from 'state/data-layer/wpcom-http/actions';
import { dispatchRequest } from 'state/data-layer/wpcom-http/utils';
import { fromApi } from './utils';
import { requestLockError, updateLock } from '../../locks/actions';
import { ZONINATOR_REQUEST_LOCK } from 'zoninator/state/action-types';

export const fetch = ( action ) =>
	http(
		{
			method: 'POST',
			path: `/jetpack-blogs/${ action.siteId }/rest-api/`,
			query: {
				path: `/zoninator/v1/zones/${ action.zoneId }/lock&_method=PUT`,
			},
		},
		action
	);

export const onSuccess = ( { siteId, zoneId }, lock ) =>
	updateLock( siteId, zoneId, lock.expires, lock.maxLockPeriod );

export const onError = ( { siteId, zoneId } ) => requestLockError( siteId, zoneId );

export default {
	[ ZONINATOR_REQUEST_LOCK ]: [ dispatchRequest( { fetch, fromApi, onSuccess, onError } ) ],
};
