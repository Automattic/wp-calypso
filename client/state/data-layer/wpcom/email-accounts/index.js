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
import {
	receiveGetEmailAccountsSuccess,
	receiveGetEmailAccountsFailure,
} from 'state/email-accounts/actions';
import { prepareAccounts } from './utils';
import { registerHandlers } from 'state/data-layer/handler-registry';

export const getEmailAccounts = ( action ) => {
	if ( config.isEnabled( 'email-accounts/enabled' ) ) {
		return receiveGetEmailAccountsSuccess( action.siteId, {
			accounts: prepareAccounts( [
				{
					domain_name: 'domain-one.com',
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
					domain_name: 'domain-two.com',
					product_name: 'Titan Business',
					product_slug: 'titan_business',
					product_type: 'titan',
					site_id: action.siteId,
					mailboxes: [
						{
							name: 'eleven',
							first_name: 'Eleven',
							last_name: 'Last',
							state: 'active',
						},
						{
							name: 'twelve',
							first_name: 'Twelve',
							last_name: 'Last',
							state: 'active',
						},
						{
							name: 'thirteen',
							first_name: 'Thirteen',
							last_name: 'Last',
							state: 'active',
						},
					],
				},
				{
					domain_name: 'domain-one.com',
					product_name: 'G Suite Business',
					product_slug: 'gapps_unlimited',
					product_type: 'gapps',
					site_id: action.siteId,
					mailboxes: [
						{
							name: 'three',
							first_name: 'Three',
							last_name: 'Last',
							state: 'active',
							meta: {
								has_agreed_to_terms: true,
							},
						},
					],
				},
				{
					domain_name: 'domain-five.com',
					product_name: 'G Suite Basic',
					product_slug: 'gapps',
					product_type: 'gapps',
					site_id: action.siteId,
					mailboxes: [
						{
							name: 'four',
							first_name: 'Four',
							last_name: 'Last',
							state: 'suspended',
							meta: {
								has_agreed_to_terms: false,
							},
						},
					],
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
