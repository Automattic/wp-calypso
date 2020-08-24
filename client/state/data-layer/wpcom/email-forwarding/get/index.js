/**
 * External Dependencies
 */
import React from 'react';
import { translate } from 'i18n-calypso';

/**
 * Internal dependencies
 */
import { CALYPSO_CONTACT } from 'lib/url/support';
import { EMAIL_FORWARDING_REQUEST } from 'state/action-types';
import { http } from 'state/data-layer/wpcom-http/actions';
import { errorNotice } from 'state/notices/actions';
import { dispatchRequest } from 'state/data-layer/wpcom-http/utils';
import {
	receiveGetEmailForwardsSuccess,
	receiveGetEmailForwardsFailure,
} from 'state/email-forwarding/actions';

import { registerHandlers } from 'state/data-layer/handler-registry';

export const getEmailForwards = ( action ) => {
	return http(
		{
			method: 'GET',
			path: `/domains/${ encodeURIComponent( action.domainName ) }/email`,
		},
		action
	);
};

export const getEmailForwardsFailure = ( action, error ) => {
	const { domainName } = action;
	const failureMessage = translate(
		'Failed to retrieve email forwarding records for %(domainName)s. ' +
			'Please try again or ' +
			'{{contactSupportLink}}contact support{{/contactSupportLink}}.',
		{
			components: {
				contactSupportLink: <a href={ CALYPSO_CONTACT } />,
			},
			args: {
				domainName,
			},
		}
	);

	return [ errorNotice( failureMessage ), receiveGetEmailForwardsFailure( domainName, error ) ];
};

export const getEmailForwardsSuccess = ( action, response ) => {
	if ( response && response.type ) {
		switch ( response.type ) {
			case 'forward':
				return response.forwards
					? receiveGetEmailForwardsSuccess( action.domainName, response )
					: getEmailForwardsFailure( action, {
							message: 'No forwards in `forward` type response',
					  } );
			case 'google-apps-another-provider':
			case 'google-apps':
				return receiveGetEmailForwardsSuccess( action.domainName, response );
			case 'custom':
				return response.mx_servers
					? receiveGetEmailForwardsSuccess( action.domainName, response )
					: getEmailForwardsFailure( action, {
							message: 'No mx_servers in `custom` type response',
					  } );
			default:
				break;
		}
	}
	return getEmailForwardsFailure( action, { message: 'No `type` in get forwards response.' } );
};

registerHandlers( 'state/data-layer/wpcom/email-forwarding/get/index.js', {
	[ EMAIL_FORWARDING_REQUEST ]: [
		dispatchRequest( {
			fetch: getEmailForwards,
			onSuccess: getEmailForwardsSuccess,
			onError: getEmailForwardsFailure,
		} ),
	],
} );
