import { AnyAction } from 'redux';
import formatApiPartner from 'calypso/jetpack-cloud/sections/partner-portal/lib/format-api-partner';
import { JETPACK_PARTNER_PORTAL_PARTNER_REQUEST } from 'calypso/state/action-types';
import { http } from 'calypso/state/data-layer/wpcom-http/actions';
import { noRetry } from 'calypso/state/data-layer/wpcom-http/pipeline/retry-on-failure/policies';
import { dispatchRequest as vanillaDispatchRequest } from 'calypso/state/data-layer/wpcom-http/utils';
import { receivePartnerError, receivePartner } from 'calypso/state/partner-portal/partner/actions';
import {
	APIError,
	DispatchRequest,
	Partner,
	PartnerPortalThunkAction,
} from 'calypso/state/partner-portal/types';

export function fetchPartnerHandler( action: AnyAction ): AnyAction {
	return http(
		{
			method: 'GET',
			apiNamespace: 'wpcom/v2',
			path: '/jetpack-licensing/partner',
			// Ignore type checking because TypeScript is incorrectly inferring the prop type due to .js usage in wpcom-http/actions
			// eslint-disable-next-line @typescript-eslint/ban-ts-comment
			// @ts-ignore
			retryPolicy: noRetry(),
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
