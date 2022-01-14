import {
	ATOMIC_SOFTWARE_INITIATE_INSTALL,
	ATOMIC_SOFTWARE_REQUEST_STATUS,
} from 'calypso/state/action-types';
import { recordTracksEvent } from 'calypso/state/analytics/actions';
import {
	setAtomicSoftwareStatus,
	setAtomicSoftwareError,
	cleanAtomicSoftwareStatus,
} from 'calypso/state/atomic/software/actions';
import { registerHandlers } from 'calypso/state/data-layer/handler-registry';
import { http } from 'calypso/state/data-layer/wpcom-http/actions';
import { noRetry } from 'calypso/state/data-layer/wpcom-http/pipeline/retry-on-failure/policies';
import { dispatchRequest } from 'calypso/state/data-layer/wpcom-http/utils';

const installSoftware = ( action ) => [
	// Clean up the status in case it's an installing reattempt.
	cleanAtomicSoftwareStatus( action.siteId, action.softwareSet ),
	http(
		{
			apiNamespace: 'wpcom/v2',
			method: 'POST',
			path: `/sites/${ action.siteId }/atomic/software/${ action.softwareSet }`,
			body: {}, // have to have an empty body to make wpcom-http happy
		},
		action
	),
];

const receiveInstallResponse = () => [
	recordTracksEvent( 'calypso_atomic_software_install_inititate_success', {
		context: 'atomic_software_install',
	} ),
];

const receiveInstallError = ( action, error ) => [
	recordTracksEvent( 'calypso_atomic_software_install_inititate_failure', {
		context: 'atomic_software_install',
		error: error.error,
	} ),
	setAtomicSoftwareError( action.siteId, action.softwareSet, error ),
];

const requestSoftware = ( action ) =>
	http(
		{
			apiNamespace: 'wpcom/v2',
			method: 'GET',
			path: `/sites/${ action.siteId }/atomic/software/${ action.softwareSet }`,
			retryPolicy: noRetry(),
		},
		action
	);

const receiveSoftwareResponse = ( action, response ) => [
	setAtomicSoftwareStatus( action.siteId, action.softwareSet, response ),
];

const receiveSoftwareError = ( action, error ) => [
	setAtomicSoftwareError( action.siteId, action.softwareSet, error ),
];

registerHandlers( 'state/data-layer/wpcom/sites/atomic/software', {
	[ ATOMIC_SOFTWARE_INITIATE_INSTALL ]: [
		dispatchRequest( {
			fetch: installSoftware,
			onSuccess: receiveInstallResponse,
			onError: receiveInstallError,
		} ),
	],
	[ ATOMIC_SOFTWARE_REQUEST_STATUS ]: [
		dispatchRequest( {
			fetch: requestSoftware,
			onSuccess: receiveSoftwareResponse,
			onError: receiveSoftwareError,
		} ),
	],
} );
