import { translate } from 'i18n-calypso';
import {
	ATOMIC_PLUGIN_INSTALL_INITIATE,
	ATOMIC_PLUGIN_INSTALL_REQUEST_STATUS,
} from 'calypso/state/action-types';
import { recordTracksEvent } from 'calypso/state/analytics/actions';
import { setAtomicSoftwareStatus } from 'calypso/state/atomic/software/actions';
import { registerHandlers } from 'calypso/state/data-layer/handler-registry';
import { http } from 'calypso/state/data-layer/wpcom-http/actions';
import { dispatchRequest } from 'calypso/state/data-layer/wpcom-http/utils';
import { errorNotice } from 'calypso/state/notices/actions';

const installSoftware = ( action ) =>
	http(
		{
			apiNamespace: 'wpcom/v2',
			method: 'POST',
			path: `/sites/${ action.siteId }/atomic/software/${ action.softwareSet }`,
			body: {}, // have to have an empty body to make wpcom-http happy
		},
		action
	);

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
	errorNotice(
		translate( "Sorry, we've hit a snag. Please contact support so we can help you out." )
	),
];

const requestSoftware = ( action ) =>
	http(
		{
			apiNamespace: 'wpcom/v2',
			method: 'GET',
			path: `/sites/${ action.siteId }/atomic/software/${ action.softwareSet }`,
		},
		action
	);

const receiveSoftwareResponse = ( action, response ) => [
	setAtomicSoftwareStatus( action.siteId, action.softwareSet, response ),
];

const receiveSoftwareError = ( action, error ) => [
	setAtomicSoftwareStatus( action.siteId, action.softwareSet, error.error ),
];

registerHandlers( 'state/data-layer/wpcom/sites/atomic/software', {
	[ ATOMIC_PLUGIN_INSTALL_INITIATE ]: [
		dispatchRequest( {
			fetch: installSoftware,
			onSuccess: receiveInstallResponse,
			onError: receiveInstallError,
		} ),
	],
	[ ATOMIC_PLUGIN_INSTALL_REQUEST_STATUS ]: [
		dispatchRequest( {
			fetch: requestSoftware,
			onSuccess: receiveSoftwareResponse,
			onError: receiveSoftwareError,
		} ),
	],
} );
