/**
 * Internal dependencies
 */
import { http } from 'calypso/state/data-layer/wpcom-http/actions';
import { dispatchRequest } from 'calypso/state/data-layer/wpcom-http/utils';
import {
	fetchWapiDomainInfoFailure,
	fetchWapiDomainInfoSuccess,
} from 'calypso/state/domains/transfer/actions';
import { DOMAIN_WAPI_INFO_FETCH } from 'calypso/state/action-types';

import { registerHandlers } from 'calypso/state/data-layer/handler-registry';

export const fetchWapiDomainInfo = ( action ) =>
	http(
		{
			apiVersion: '1.1',
			method: 'GET',
			path: '/domains/' + action.domain + '/status/',
		},
		action
	);

export const handlefetchWapiDomainInfoSuccess = ( action, status ) => [
	fetchWapiDomainInfoSuccess( action.domain, status ),
];

export const handlefetchWapiDomainInfoFailure = ( action, error ) => [
	fetchWapiDomainInfoFailure( action.domain, error ),
];

registerHandlers( 'state/data-layer/wpcom/domains/status/index.js', {
	[ DOMAIN_WAPI_INFO_FETCH ]: [
		dispatchRequest( {
			fetch: fetchWapiDomainInfo,
			onSuccess: handlefetchWapiDomainInfoSuccess,
			onError: handlefetchWapiDomainInfoFailure,
		} ),
	],
} );
