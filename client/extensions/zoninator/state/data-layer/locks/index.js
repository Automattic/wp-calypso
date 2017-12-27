/** @format */

/**
 * External dependencies
 */
import { translate } from 'i18n-calypso';

/**
 * Internal dependencies
 */
import { http } from 'state/data-layer/wpcom-http/actions';
import { dispatchRequest } from 'state/data-layer/wpcom-http/utils';
import { errorNotice, removeNotice } from 'state/notices/actions';
import { fromApi } from './utils';
import { requestLockError, updateLock } from '../../locks/actions';
import { ZONINATOR_REQUEST_LOCK } from 'zoninator/state/action-types';

const updateLockNotice = 'zoninator-update-lock';

export const requestZoneLock = ( { dispatch }, action ) => {
	const { siteId, zoneId } = action;

	dispatch( removeNotice( updateLockNotice ) );
	dispatch(
		http(
			{
				method: 'POST',
				path: `/jetpack-blogs/${ siteId }/rest-api/`,
				query: {
					path: `/zoninator/v1/zones/${ zoneId }/lock&_method=PUT`,
				},
			},
			action
		)
	);
};

export const handleLockSuccess = ( { dispatch }, { siteId, zoneId }, response ) => {
	const lock = fromApi( response.data );
	dispatch( updateLock( siteId, zoneId, lock.expires, lock.maxLockPeriod ) );
};

export const handleLockFailure = ( { dispatch }, { siteId, zoneId } ) => {
	dispatch( requestLockError( siteId, zoneId ) );
	dispatch(
		errorNotice( translate( 'This zone is currently locked. Please try again later.' ), {
			id: updateLockNotice,
		} )
	);
};

const dispatchCreateLockRequest = dispatchRequest(
	requestZoneLock,
	handleLockSuccess,
	handleLockFailure
);

export default {
	[ ZONINATOR_REQUEST_LOCK ]: [ dispatchCreateLockRequest ],
};
