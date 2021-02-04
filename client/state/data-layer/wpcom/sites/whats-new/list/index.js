/**
 * Internal dependencies
 */
import { http } from 'calypso/state/data-layer/wpcom-http/actions';
import { dispatchRequest } from 'calypso/state/data-layer/wpcom-http/utils';
import { registerHandlers } from 'calypso/state/data-layer/handler-registry';
import { WHATS_NEW_LIST_REQUEST } from 'calypso/state/action-types';
import { setWhatsNewList } from 'calypso/state/whats-new/actions';

const requestWhatsNewList = ( action ) => {
	return http(
		{
			method: 'GET',
			path: `/sites/${ action.siteId }/whats-new/list`,
			apiNamespace: 'wpcom/v2',
		},
		action
	);
};

const setList = ( { siteId }, list ) => setWhatsNewList( siteId, list );

registerHandlers( 'state/data-layer/wpcom/sites/whats-new/list/index.js', {
	[ WHATS_NEW_LIST_REQUEST ]: [
		dispatchRequest( {
			fetch: requestWhatsNewList,
			onSuccess: setList,
		} ),
	],
} );
