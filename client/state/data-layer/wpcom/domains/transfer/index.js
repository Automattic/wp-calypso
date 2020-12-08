/**
 * External dependencies
 */
import { translate } from 'i18n-calypso';

/**
 * Internal dependencies
 */
import { http } from 'calypso/state/data-layer/wpcom-http/actions';
import { dispatchRequest } from 'calypso/state/data-layer/wpcom-http/utils';
import { updateDomainTransfer } from 'calypso/state/domains/transfer/actions';
import { DOMAIN_TRANSFER_IPS_TAG_SAVE } from 'calypso/state/action-types';
import { errorNotice } from 'calypso/state/notices/actions';

import { registerHandlers } from 'calypso/state/data-layer/handler-registry';

/**
 * Generates actions to save the domain IPS tag at OpenSRS
 * and notify the front end save is in progress (for dialog
 * submit button management).
 *
 * @param 	{string} action saveDomainIpsTag action
 * @returns {Array} array of further actions
 */
export const saveDomainIpsTag = ( action ) => {
	const { domain, ipsTag } = action;

	return [
		updateDomainTransfer( domain, { saveStatus: 'saving' } ),
		http(
			{
				apiVersion: '1',
				method: 'POST',
				path: '/domains/' + domain + '/transfer/',
				body: {
					domainStatus: JSON.stringify( {
						command: 'set-ips-tag',
						payload: { ips_tag: ipsTag },
					} ),
				},
			},
			action
		),
	];
};

export const handleIpsTagSaveSuccess = ( { domain, selectedRegistrar } ) =>
	updateDomainTransfer( domain, { selectedRegistrar, saveStatus: 'success' } );

export const handleIpsTagSaveFailure = ( { domain, selectedRegistrar } ) => [
	updateDomainTransfer( domain, { selectedRegistrar, saveStatus: 'error' } ),
	errorNotice( translate( 'IPS tag save failed!' ), {
		duration: 20000,
		id: 'ips-tag-save-failure-notice',
		isPersistent: true,
		href: 'https://wordpress.com/help/contact',
		button: 'Get Help',
		showDismiss: false,
	} ),
];

registerHandlers( 'state/data-layer/wpcom/domains/transfer/index.js', {
	[ DOMAIN_TRANSFER_IPS_TAG_SAVE ]: [
		dispatchRequest( {
			fetch: saveDomainIpsTag,
			onSuccess: handleIpsTagSaveSuccess,
			onError: handleIpsTagSaveFailure,
		} ),
	],
} );
