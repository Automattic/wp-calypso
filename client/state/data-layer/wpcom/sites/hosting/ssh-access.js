import {
	HOSTING_SSH_ACCESS_REQUEST,
	HOSTING_SSH_ACCESS_ENABLE,
	HOSTING_SSH_ACCESS_DISABLE,
} from 'calypso/state/action-types';
import { registerHandlers } from 'calypso/state/data-layer/handler-registry';
import { http } from 'calypso/state/data-layer/wpcom-http/actions';
import { dispatchRequest } from 'calypso/state/data-layer/wpcom-http/utils';
import { setAtomicSshAccess } from 'calypso/state/hosting/actions';

const getSshAccessStatus = ( action ) =>
	http(
		{
			method: 'GET',
			path: `/sites/${ action.siteId }/hosting/ssh-access`,
			apiNamespace: 'wpcom/v2',
			body: {},
		},
		action
	);

const enableSshAccess = ( action ) =>
	http(
		{
			method: 'POST',
			path: `/sites/${ action.siteId }/hosting/ssh-access`,
			apiNamespace: 'wpcom/v2',
			body: {
				setting: 'ssh',
			},
		},
		action
	);

const disableSshAccess = ( action ) =>
	http(
		{
			method: 'POST',
			path: `/sites/${ action.siteId }/hosting/ssh-access`,
			apiNamespace: 'wpcom/v2',
			body: {
				setting: 'sftp',
			},
		},
		action
	);

const setSshAccess = ( { siteId }, status ) => {
	return setAtomicSshAccess( siteId, status );
};

registerHandlers( 'state/data-layer/wpcom/sites/hosting/ssh-access.js', {
	[ HOSTING_SSH_ACCESS_REQUEST ]: [
		dispatchRequest( {
			fetch: getSshAccessStatus,
			onSuccess: setSshAccess,
			onError: () => {},
			fromApi: ( { setting } ) => setting,
		} ),
	],
	[ HOSTING_SSH_ACCESS_ENABLE ]: [
		dispatchRequest( {
			fetch: enableSshAccess,
			onSuccess: setSshAccess,
			onError: () => {},
			fromApi: ( setting ) => setting,
		} ),
	],
	[ HOSTING_SSH_ACCESS_DISABLE ]: [
		dispatchRequest( {
			fetch: disableSshAccess,
			onSuccess: setSshAccess,
			onError: () => {},
			fromApi: ( setting ) => setting,
		} ),
	],
} );
