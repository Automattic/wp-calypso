/**
 * External dependencies
 */
import { translate } from 'i18n-calypso';

/**
 * Internal dependencies
 */
import { dispatchRequest } from 'state/data-layer/wpcom-http/utils';
import { errorNotice, successNotice } from 'state/notices/actions';
import { http } from 'state/data-layer/wpcom-http/actions';
import { refreshSitePlans } from 'state/sites/plans/actions';
import { SITE_PLAN_OWNERSHIP_TRANSFER } from 'state/action-types';

import { registerHandlers } from 'state/data-layer/handler-registry';

const noticeOptions = ( siteId ) => ( {
	duration: 8000,
	id: `sites-plan-transfer-notice-${ siteId }`,
} );

/**
 * Dispatches a request to transfer a site's plan to another user.
 *
 * @param   {object} action Redux action
 * @returns {object} Dispatched http action
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
 * @param   {object} action Redux action
 * @returns {object} Success notice action
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
 * @param   {object} action Redux action
 * @param   {object} error  Error object
 * @returns {object} Error notice action
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
