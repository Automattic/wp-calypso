import { translate } from 'i18n-calypso';
import {
	HOSTING_SSH_KEYS_REQUEST,
	HOSTING_SSH_KEY_ATTACH,
	HOSTING_SSH_KEY_DETACH,
} from 'calypso/state/action-types';
import { registerHandlers } from 'calypso/state/data-layer/handler-registry';
import { http } from 'calypso/state/data-layer/wpcom-http/actions';
import { dispatchRequest } from 'calypso/state/data-layer/wpcom-http/utils';
import { setAtomicSshKeys } from 'calypso/state/hosting/actions';
import { errorNotice } from 'calypso/state/notices/actions';

const getSshKeys = ( action ) =>
	http(
		{
			method: 'GET',
			path: `/sites/${ action.siteId }/hosting/ssh-keys`,
			apiNamespace: 'wpcom/v2',
			body: {},
		},
		action
	);

const attachSshKey = ( action ) =>
	http(
		{
			method: 'POST',
			path: `/sites/${ action.siteId }/hosting/ssh-keys`,
			apiNamespace: 'wpcom/v2',
			body: {
				name: action.name,
			},
		},
		action
	);

const detachSshKey = ( action ) =>
	http(
		{
			method: 'DELETE',
			path: `/sites/${ action.siteId }/hosting/ssh-keys`,
			apiNamespace: 'wpcom/v2',
			body: {
				name: action.name,
			},
		},
		action
	);

const setSshKeys = ( { siteId }, sshKeys ) => {
	return setAtomicSshKeys( siteId, sshKeys );
};

const displaySshKeysError = () => [
	errorNotice(
		translate(
			'Sorry, we had a problem retrieving your SSH keys details. Please refresh the page and try again.'
		),
		{
			duration: 5000,
		}
	),
];

const fromApi = ( { ssh_keys } ) => ssh_keys;

registerHandlers( 'state/data-layer/wpcom/sites/hosting/ssh-keys.js', {
	[ HOSTING_SSH_KEYS_REQUEST ]: [
		dispatchRequest( {
			fetch: getSshKeys,
			onSuccess: setSshKeys,
			onError: displaySshKeysError,
			fromApi,
		} ),
	],
	[ HOSTING_SSH_KEY_ATTACH ]: [
		dispatchRequest( {
			fetch: attachSshKey,
			onSuccess: setSshKeys,
			onError: displaySshKeysError,
			fromApi,
		} ),
	],
	[ HOSTING_SSH_KEY_DETACH ]: [
		dispatchRequest( {
			fetch: detachSshKey,
			onSuccess: setSshKeys,
			onError: displaySshKeysError,
			fromApi,
		} ),
	],
} );
