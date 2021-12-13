import { translate } from 'i18n-calypso';
import { ATOMIC_TRANSFER_INITIATE_TRANSFER } from 'calypso/state/action-types';
import { recordTracksEvent } from 'calypso/state/analytics/actions';
import { setLatestAtomicTransfer } from 'calypso/state/atomic/transfers/actions';
import { registerHandlers } from 'calypso/state/data-layer/handler-registry';
import { http } from 'calypso/state/data-layer/wpcom-http/actions';
import { dispatchRequest } from 'calypso/state/data-layer/wpcom-http/utils';
import { errorNotice } from 'calypso/state/notices/actions';

const initiateAtomicTransfer = ( action ) =>
	http(
		{
			apiNamespace: 'wpcom/v2',
			method: 'POST',
			path: `/sites/${ action.siteId }/atomic/transfers/`,
			...( action.softwareSet
				? {
						body: {
							software_set: action.softwareSet,
						},
				  }
				: {} ),
		},
		action
	);

const receiveResponse = () => [
	recordTracksEvent( 'calypso_atomic_transfer_inititate_success', {
		context: 'atomic_transfer',
	} ),
];

const receiveError = ( action, error ) => [
	recordTracksEvent( 'calypso_atomic_transfer_inititate_failure', {
		context: 'atomic_transfer',
		error: error.error,
	} ),
	errorNotice(
		translate( "Sorry, we've hit a snag. Please contact support so we can help you out." )
	),
	setLatestAtomicTransfer( action.siteId, error ),
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
