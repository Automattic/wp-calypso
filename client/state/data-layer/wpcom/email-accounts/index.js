/**
 * External Dependencies
 */
import { translate } from 'i18n-calypso';

/**
 * Internal dependencies
 */
import { EMAIL_ACCOUNTS_REQUEST } from 'state/action-types';
import { http } from 'state/data-layer/wpcom-http/actions';
import { errorNotice } from 'state/notices/actions';
import { dispatchRequest } from 'state/data-layer/wpcom-http/utils';
import {
	receiveGetEmailAccountsSuccess,
	receiveGetEmailAccountsFailure,
} from 'state/email-accounts/actions';
import { registerHandlers } from 'state/data-layer/handler-registry';

export const getEmailAccounts = ( action ) => {
	if ( action.useBuffer ) {
		return receiveGetEmailAccountsSuccess( action.siteId, {
			accounts: [
				{
					email: 'sample@domain.com',
					mailbox: 'sample',
					site_id: action.siteId,
					domain: 'domain.com',
					firstname: 'First',
					lastname: 'Last',
					fullname: 'First Last',
					suspended: false,
					product_slug: 'titan',
					product_name: 'Titan',
				},
			],
		} );
	}

	return http(
		{
			method: 'GET',
			path: `/sites/${ action.siteId }/email-accounts`,
		},
		action
	);
};

export const getEmailAccountsFailure = ( action, error ) => {
	return [
		errorNotice( translate( 'Failed to retrieve email accounts' ) ),
		receiveGetEmailAccountsFailure( action.siteId, error ),
	];
};

export const getEmailAccountsSuccess = ( action, response ) => {
	if ( response ) {
		return receiveGetEmailAccountsSuccess( action.siteId, response );
	}
	return getEmailAccountsFailure( action, { message: 'No response.' } );
};

registerHandlers( 'state/data-layer/wpcom/email-accounts/index.js', {
	[ EMAIL_ACCOUNTS_REQUEST ]: [
		dispatchRequest( {
			fetch: getEmailAccounts,
			onSuccess: getEmailAccountsSuccess,
			onError: getEmailAccountsFailure,
		} ),
	],
} );
