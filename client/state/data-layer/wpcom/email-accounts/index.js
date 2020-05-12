/**
 * External Dependencies
 */
import { translate } from 'i18n-calypso';

/**
 * Internal dependencies
 */
import config from 'config';
import { dispatchRequest } from 'state/data-layer/wpcom-http/utils';
import { EMAIL_ACCOUNTS_REQUEST } from 'state/action-types';
import { errorNotice } from 'state/notices/actions';
import { http } from 'state/data-layer/wpcom-http/actions';
import { prepareAccounts } from './utils';
import {
	receiveGetEmailAccountsSuccess,
	receiveGetEmailAccountsFailure,
} from 'state/email-accounts/actions';
import { registerHandlers } from 'state/data-layer/handler-registry';

export const getEmailAccounts = ( action ) => {
	if ( config.isEnabled( 'email-accounts/enabled' ) ) {
		return receiveGetEmailAccountsSuccess( action.siteId, {
			accounts: prepareAccounts( [
				{
					email: 'one@domain.com',
					site_id: action.siteId,
					domain: 'domain.com',
					first_name: 'One',
					last_name: 'Last',
					product_slug: 'titan',
					product_name: 'Titan Basic',
					provider_slug: 'titan',
				},
				{
					email: 'two@domain.com',
					site_id: action.siteId,
					domain: 'domain.com',
					first_name: 'Two',
					last_name: 'Last',
					product_slug: 'titan',
					product_name: 'Titan Basic',
					provider_slug: 'titan',
				},
				{
					email: 'one@other-domain.com',
					site_id: action.siteId,
					domain: 'other-domain.com',
					first_name: 'One',
					last_name: 'Last',
					product_slug: 'gapps',
					product_name: 'G Suite Basic',
					provider_slug: 'gapps',
				},
			] ),
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
	return getEmailAccountsFailure( action, {
		message: 'Failed to retrieve your email accounts. No response was received',
	} );
};

registerHandlers( 'state/data-layer/wpcom/email-accounts/index.js', {
	[ EMAIL_ACCOUNTS_REQUEST ]: [
		dispatchRequest( {
			fetch: getEmailAccounts,
			onSuccess: getEmailAccountsSuccess,
			onError: getEmailAccountsFailure,
			fromApi: prepareAccounts,
		} ),
	],
} );
