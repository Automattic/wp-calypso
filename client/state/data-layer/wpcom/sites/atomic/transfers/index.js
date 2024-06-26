import { ATOMIC_TRANSFER_INITIATE_TRANSFER } from 'calypso/state/action-types';
import { recordTracksEvent } from 'calypso/state/analytics/actions';
import {
	setLatestAtomicTransfer,
	setLatestAtomicTransferError,
} from 'calypso/state/atomic/transfers/actions';
import { registerHandlers } from 'calypso/state/data-layer/handler-registry';
import { http } from 'calypso/state/data-layer/wpcom-http/actions';
import { dispatchRequest } from 'calypso/state/data-layer/wpcom-http/utils';

export const mapToRequestBody = ( action ) => {
	const requestBody = {};

	if ( action.softwareSet ) {
		requestBody.software_set = action.softwareSet;
	}

	if ( action.themeSlug ) {
		requestBody.theme_slug = action.themeSlug;
	}

	if ( action.pluginSlug ) {
		requestBody.plugin_slug = action.pluginSlug;
	}

	if ( action.themeFile ) {
		requestBody.theme_file = action.themeFile;
	}

	if ( action.pluginFile ) {
		requestBody.plugin_file = action.pluginFile;
	}

	if ( action.context ) {
		requestBody.context = action.context;
	}

	if ( action.transferIntent ) {
		requestBody.transfer_intent = action.transferIntent;
	}

	return requestBody;
};

const initiateAtomicTransfer = ( action ) =>
	http(
		{
			apiNamespace: 'wpcom/v2',
			method: 'POST',
			path: `/sites/${ action.siteId }/atomic/transfers/`,
			body: mapToRequestBody( action ),
		},
		action
	);

const receiveResponse = ( action, transfer ) => [
	recordTracksEvent( 'calypso_atomic_transfer_inititate_success', {
		context: 'atomic_transfer',
	} ),
	setLatestAtomicTransfer( action.siteId, transfer ),
];

const receiveError = ( action, error ) => [
	recordTracksEvent( 'calypso_atomic_transfer_inititate_failure', {
		context: 'atomic_transfer',
		error: error.error,
	} ),
	setLatestAtomicTransferError( action.siteId, error ),
];

registerHandlers( 'state/data-layer/wpcom/sites/atomic/transfers', {
	[ ATOMIC_TRANSFER_INITIATE_TRANSFER ]: [
		dispatchRequest( {
			fetch: initiateAtomicTransfer,
			onSuccess: receiveResponse,
			onError: receiveError,
		} ),
	],
} );
