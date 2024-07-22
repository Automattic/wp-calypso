import {
	DOMAIN_NOTICES_STATUS_REQUEST,
	DOMAIN_NOTICES_STATUS_DISMISS,
} from 'calypso/state/action-types';
import { registerHandlers } from 'calypso/state/data-layer/handler-registry';
import { http } from 'calypso/state/data-layer/wpcom-http/actions';
import { dispatchRequest } from 'calypso/state/data-layer/wpcom-http/utils';
import { requestDomainNoticesStatusCompleted } from 'calypso/state/domains/notices/actions';

const noop = () => {};

export const requestDomainNoticesStatus = ( action ) =>
	http(
		{
			apiVersion: '1.1',
			method: 'GET',
			path: '/domains/' + action.domainName + '/notices/',
		},
		action
	);

export const requestDomainNoticesStatusSuccess = ( action, response ) => ( dispatch ) => {
	const states = response.states ?? {};

	dispatch(
		requestDomainNoticesStatusCompleted( action.domainName, states[ action.domainName ] ?? {} )
	);
};

export const dismissDomainNotice = ( action ) =>
	http(
		{
			apiVersion: '1.1',
			method: 'POST',
			path: '/domains/' + action.domainName + '/notices/' + action.noticeType + '/dismiss/',
		},
		action
	);

registerHandlers( 'state/data-layer/wpcom/domains/notices/index.js', {
	[ DOMAIN_NOTICES_STATUS_REQUEST ]: [
		dispatchRequest( {
			fetch: requestDomainNoticesStatus,
			onSuccess: requestDomainNoticesStatusSuccess,
			onError: noop,
		} ),
	],
	[ DOMAIN_NOTICES_STATUS_DISMISS ]: [
		dispatchRequest( {
			fetch: dismissDomainNotice,
			onSuccess: requestDomainNoticesStatusSuccess,
			onError: noop,
		} ),
	],
} );
