import { translate } from 'i18n-calypso';
import {
	HOSTING_SSH_ACCESS_REQUEST,
	HOSTING_SSH_ACCESS_ENABLE,
	HOSTING_SSH_ACCESS_DISABLE,
} from 'calypso/state/action-types';
import { registerHandlers } from 'calypso/state/data-layer/handler-registry';
import { http } from 'calypso/state/data-layer/wpcom-http/actions';
import { dispatchRequest } from 'calypso/state/data-layer/wpcom-http/utils';
import { setAtomicSshAccess } from 'calypso/state/hosting/actions';
import { errorNotice } from 'calypso/state/notices/actions';

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

const displaySshAccessError = () => [
	errorNotice(
		translate(
			'Sorry, we had a problem retrieving your SSH access details. Please refresh the page and try again.'
		),
		{
			duration: 5000,
		}
	),
];

registerHandlers( 'state/data-layer/wpcom/sites/hosting/ssh-access.js', {
	[ HOSTING_SSH_ACCESS_REQUEST ]: [
		dispatchRequest( {
			fetch: getSshAccessStatus,
			onSuccess: setSshAccess,
			onError: displaySshAccessError,
			fromApi: ( { setting } ) => setting,
		} ),
	],
	[ HOSTING_SSH_ACCESS_ENABLE ]: [
		dispatchRequest( {
			fetch: enableSshAccess,
			onSuccess: setSshAccess,
			onError: displaySshAccessError,
			fromApi: ( { setting } ) => setting,
		} ),
	],
	[ HOSTING_SSH_ACCESS_DISABLE ]: [
		dispatchRequest( {
			fetch: disableSshAccess,
			onSuccess: setSshAccess,
			onError: displaySshAccessError,
			fromApi: ( { setting } ) => setting,
		} ),
	],
} );
