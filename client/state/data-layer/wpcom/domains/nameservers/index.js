/**
 * External dependencies
 */
import { translate } from 'i18n-calypso';

/**
 * Internal dependencies
 */
import { http } from 'calypso/state/data-layer/wpcom-http/actions';
import { dispatchRequest } from 'calypso/state/data-layer/wpcom-http/utils';
import { DOMAIN_NAMESERVERS_FETCH, DOMAIN_NAMESERVERS_UPDATE } from 'calypso/state/action-types';
import { errorNotice, successNotice } from 'calypso/state/notices/actions';
import {
	fetchNameserversFailure,
	receiveNameservers,
} from 'calypso/state/domains/nameservers/actions';
import { registerHandlers } from 'calypso/state/data-layer/handler-registry';

export const fetchDomainNameservers = ( action ) =>
	http(
		{
			apiVersion: '1.1',
			method: 'GET',
			path: `/domains/${ action.domainName }/nameservers/`,
		},
		action
	);

export const fetchDomainNameserversSuccess = ( { domainName }, nameservers ) =>
	receiveNameservers( domainName, nameservers );

export const fetchDomainNameserversError = ( { domainName } ) =>
	fetchNameserversFailure( domainName );

export const updateDomainNameservers = ( action ) =>
	http(
		{
			apiVersion: '1.1',
			method: 'POST',
			path: `/domains/${ action.domainName }/nameservers/`,
			body: {
				nameservers: action.nameservers.map( ( nameserver ) => ( {
					nameserver,
				} ) ),
			},
		},
		action
	);

export const updateDomainNameserversSuccess = ( { domainName }, nameservers ) => [
	receiveNameservers( domainName, nameservers ),
	successNotice( translate( 'Yay, the name servers have been successfully updated!' ), {
		duration: 5000,
		id: `nameserver-update-notification-${ domainName }`,
	} ),
];

export const updateDomainNameserversError = ( action, error ) => {
	const defaultMessage = translate( 'An error occurred while updating the nameservers.' );
	return errorNotice( error.message || defaultMessage, {
		duration: 5000,
		id: `nameserver-update-notification-${ action.domainName }`,
	} );
};

registerHandlers( 'state/data-layer/wpcom/domains/nameservers/index.js', {
	[ DOMAIN_NAMESERVERS_FETCH ]: [
		dispatchRequest( {
			fetch: fetchDomainNameservers,
			onSuccess: fetchDomainNameserversSuccess,
			onError: fetchDomainNameserversError,
		} ),
	],
	[ DOMAIN_NAMESERVERS_UPDATE ]: [
		dispatchRequest( {
			fetch: updateDomainNameservers,
			onSuccess: updateDomainNameserversSuccess,
			onError: updateDomainNameserversError,
		} ),
	],
} );
