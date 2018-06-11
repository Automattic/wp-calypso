/** @format */

/**
 * External dependencies
 */
import { translate } from 'i18n-calypso';

/**
 * Internal dependencies
 */
import { dispatchRequestEx } from 'state/data-layer/wpcom-http/utils';
import { errorNotice, successNotice } from 'state/notices/actions';
import { http } from 'state/data-layer/wpcom-http/actions';
import { SITE_PLAN_OWNERSHIP_TRANSFER } from 'state/action-types';

const noticeOptions = siteId => ( {
	duration: 8000,
	id: `sites-plan-transfer-notice-${ siteId }`,
} );

/**
 * Dispatches a request to transfer a site's plan to another user.
 *
 * @param   {Object} action Redux action
 * @returns {Object} Dispatched http action
 */
export const requestPlanOwnershipTransfer = action =>
	http(
		{
			apiVersion: '1',
			method: 'POST',
			path: '/sites/' + action.siteId + '/plan-transfer',
			query: {
				new_user_id: action.newUserId,
			},
		},
		action
	);

/**
 * Dispatches a success notice when the request succeeded.
 *
 * @param   {Object} action Redux action
 * @returns {Object} Success notice action
 */
export const handleTransferSuccess = ( { siteId } ) =>
	successNotice(
		translate( 'Plan purchaser has been changed successfully.' ),
		noticeOptions( siteId )
	);

/**
 * Dispatches an error notice when the request failed.
 *
 * @param   {Object} action Redux action
 * @param   {Object} error  Error object
 * @returns {Object} Error notice action
 */
export const handleTransferError = ( { siteId }, { message } ) =>
	errorNotice( message, noticeOptions( siteId ) );

export default {
	[ SITE_PLAN_OWNERSHIP_TRANSFER ]: [
		dispatchRequestEx( {
			fetch: requestPlanOwnershipTransfer,
			onSuccess: handleTransferSuccess,
			onError: handleTransferError,
		} ),
	],
};
