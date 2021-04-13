/**
 * External dependencies
 */
import { AnyAction } from 'redux';

/**
 * Internal dependencies
 */
import { JETPACK_PARTNER_PORTAL_PARTNER_REQUEST } from 'calypso/state/action-types';
import {
	APIError,
	DispatchRequest,
	Partner,
	PartnerPortalThunkAction,
} from 'calypso/state/partner-portal/types';
import { receivePartnerError } from 'calypso/state/partner-portal/partner/actions';
import { dispatchRequest as vanillaDispatchRequest } from 'calypso/state/data-layer/wpcom-http/utils';
import { http } from 'calypso/state/data-layer/wpcom-http/actions';
import { receivePartner } from 'calypso/state/partner-portal/partner/actions';
import { formatApiPartner } from 'calypso/jetpack-cloud/sections/partner-portal/utils';

export function fetchPartnerHandler( action: AnyAction ): AnyAction {
	return http(
		{
			method: 'GET',
			apiNamespace: 'wpcom/v2',
			path: '/jetpack-licensing/partner',
		},
		action
	) as AnyAction;
}

export function receivePartnerHandler(
	action: AnyAction,
	partner: Partner
): PartnerPortalThunkAction {
	return receivePartner( partner );
}

export function receivePartnerErrorHandler(
	action: AnyAction,
	error: APIError
): PartnerPortalThunkAction {
	return receivePartnerError( error );
}

// Avoid TypeScript warnings and be explicit about the type of dispatchRequest being mostly unknown.
const dispatchRequest = vanillaDispatchRequest as DispatchRequest;

export default {
	[ JETPACK_PARTNER_PORTAL_PARTNER_REQUEST ]: [
		dispatchRequest( {
			fetch: fetchPartnerHandler,
			onSuccess: receivePartnerHandler,
			onError: receivePartnerErrorHandler,
			fromApi: formatApiPartner,
		} ),
	],
};
