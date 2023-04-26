import { translate } from 'i18n-calypso';
import { SITE_PLAN_OWNERSHIP_TRANSFER } from 'calypso/state/action-types';
import { registerHandlers } from 'calypso/state/data-layer/handler-registry';
import { http } from 'calypso/state/data-layer/wpcom-http/actions';
import { dispatchRequest } from 'calypso/state/data-layer/wpcom-http/utils';
import { errorNotice, successNotice } from 'calypso/state/notices/actions';
import { refreshSitePlans } from 'calypso/state/sites/plans/actions';

const noticeOptions = ( siteId ) => ( {
	duration: 8000,
	id: `sites-plan-transfer-notice-${ siteId }`,
} );

/**
 * Dispatches a request to transfer a site's plan to another user.
 *
 * @param   {Object} action Redux action
 * @returns {Object} Dispatched http action
 */
export const requestPlanOwnershipTransfer = ( action ) =>
	http(
		{
			apiVersion: '1',
			method: 'POST',
			path: '/sites/' + action.siteId + '/plan-transfer',
			query: {
				new_user_id: action.newOwnerUserId,
			},
		},
		action
	);

/**
 * Dispatches a success notice when the request succeeded.
 *
 * @param   {Object} action Redux action
 * @param   {number} action.siteId
 * @returns {Object} Success notice action
 */
export const handleTransferSuccess = ( { siteId } ) => [
	successNotice(
		translate( 'Plan purchaser has been changed successfully.' ),
		noticeOptions( siteId )
	),
	refreshSitePlans( siteId ),
];

/**
 * Dispatches an error notice when the request failed.
 *
 * @param   {Object} action Redux action
 * @param   {number} action.siteId
 * @param   {Object} error  Error object
 * @param   {string} error.message
 * @returns {Object} Error notice action
 */
export const handleTransferError = ( { siteId }, { message } ) =>
	errorNotice( message, noticeOptions( siteId ) );

registerHandlers( 'state/data-layer/wpcom/sites/plan-transfer/index.js', {
	[ SITE_PLAN_OWNERSHIP_TRANSFER ]: [
		dispatchRequest( {
			fetch: requestPlanOwnershipTransfer,
			onSuccess: handleTransferSuccess,
			onError: handleTransferError,
		} ),
	],
} );
