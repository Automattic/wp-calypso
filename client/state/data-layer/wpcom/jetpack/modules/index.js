import { JETPACK_MODULE_KEY_CHECK_REQUEST } from 'calypso/state/action-types';
import { registerHandlers } from 'calypso/state/data-layer/handler-registry';
import { http } from 'calypso/state/data-layer/wpcom-http/actions';
import { dispatchRequest } from 'calypso/state/data-layer/wpcom-http/utils';
import { setJetpackModuleKeyCheck } from 'calypso/state/jetpack/modules/actions';

const requestJetpackModuleKeyCheck = ( action ) =>
	http(
		{
			apiVersion: '1.1',
			method: 'GET',
			path: `/jetpack-blogs/${ action.siteId }/rest-api/`,
			query: { path: `/jetpack/v4/module/${ action.moduleSlug }/key/check` },
		},
		action
	);

const setJetpackModuleKeyValidity = ( { moduleSlug, siteId }, response ) =>
	setJetpackModuleKeyCheck( siteId, moduleSlug, response.data.validKey );

const removeJetpackModuleKeyValidity = ( { moduleSlug, siteId } ) =>
	setJetpackModuleKeyCheck( siteId, moduleSlug, null );

registerHandlers( 'state/data-layer/wpcom/jetpack/modules/index.js', {
	[ JETPACK_MODULE_KEY_CHECK_REQUEST ]: [
		dispatchRequest( {
			fetch: requestJetpackModuleKeyCheck,
			onSuccess: setJetpackModuleKeyValidity,
			onError: removeJetpackModuleKeyValidity,
		} ),
	],
} );
