import { translate } from 'i18n-calypso';
import { ATOMIC_PLUGIN_INSTALL_INITIATE } from 'calypso/state/action-types';
import { recordTracksEvent } from 'calypso/state/analytics/actions';
import { requestAtomicInstallStatus } from 'calypso/state/atomic-transfer-with-plugin/actions';
import { registerHandlers } from 'calypso/state/data-layer/handler-registry';
import { http } from 'calypso/state/data-layer/wpcom-http/actions';
import { dispatchRequest } from 'calypso/state/data-layer/wpcom-http/utils';
import { errorNotice } from 'calypso/state/notices/actions';

const initiateAtomicSoftwareInstall = ( action ) =>
	http(
		{
			apiNamespace: 'wpcom/v2',
			method: 'POST',
			path: `/sites/${ action.siteId }/atomic/software/${ action.softwareSet }`,
		},
		action
	);

export const receiveError = ( error ) => {
	return [
		recordTracksEvent( 'calypso_atomic_software_install_inititate_failure', {
			context: 'atomic_software_install',
			error: error.error,
		} ),
		errorNotice(
			translate( "Sorry, we've hit a snag. Please contact support so we can help you out." )
		),
	];
};

export const receiveResponse = ( action ) => {
	return [
		recordTracksEvent( 'calypso_atomic_software_install_inititate_success', {
			context: 'atomic_software_install',
		} ),
		requestAtomicInstallStatus( action.siteId ),
	];
};

registerHandlers( 'state/data-layer/wpcom/sites/atomic-software/initiate', {
	[ ATOMIC_PLUGIN_INSTALL_INITIATE ]: [
		dispatchRequest( {
			fetch: initiateAtomicSoftwareInstall,
			onSuccess: receiveResponse,
			onError: receiveError,
		} ),
	],
} );
