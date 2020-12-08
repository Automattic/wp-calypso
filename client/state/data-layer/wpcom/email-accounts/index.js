/**
 * External Dependencies
 */
import { translate } from 'i18n-calypso';

/**
 * Internal dependencies
 */
import config from 'calypso/config';
import { convertToCamelCase } from 'calypso/state/data-layer/utils';
import { dispatchRequest } from 'calypso/state/data-layer/wpcom-http/utils';
import { EMAIL_ACCOUNTS_REQUEST } from 'calypso/state/action-types';
import { errorNotice } from 'calypso/state/notices/actions';
import { http } from 'calypso/state/data-layer/wpcom-http/actions';
import {
	receiveGetEmailAccountsSuccess,
	receiveGetEmailAccountsFailure,
} from 'calypso/state/email-accounts/actions';
import { registerHandlers } from 'calypso/state/data-layer/handler-registry';

export const getEmailAccounts = ( action ) => {
	if ( config.isEnabled( 'email-accounts/enabled' ) ) {
		return receiveGetEmailAccountsSuccess( action.siteId, {
			accounts: [
				{
					domain_name: 'domain.com',
					product_name: 'Titan Basic',
					product_slug: 'titan_basic',
					product_type: 'titan',
					site_id: action.siteId,
					mailboxes: [
						{
							name: 'one',
							first_name: 'One',
							last_name: 'Last',
							state: 'active',
						},
						{
							name: 'two',
							first_name: 'Two',
							last_name: 'Last',
							state: 'active',
						},
					],
				},
				{
					domain_name: 'other-domain.com',
					product_name: 'G Suite Business',
					product_slug: 'gapps_unlimited',
					product_type: 'gapps',
					site_id: action.siteId,
					mailboxes: [
						{
							name: 'three',
							first_name: 'Three',
							last_name: 'Last',
							state: 'suspended',
							meta: {
								has_agreed_to_terms: true,
							},
						},
					],
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
			fromApi: convertToCamelCase,
		} ),
	],
} );
