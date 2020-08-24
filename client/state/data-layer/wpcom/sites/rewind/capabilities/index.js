/**
 * Internal dependencies
 */
import { registerHandlers } from 'state/data-layer/handler-registry';
import { dispatchRequest } from 'state/data-layer/wpcom-http/utils';
import { http } from 'state/data-layer/wpcom-http/actions';
import { REWIND_CAPABILITIES_REQUEST, REWIND_CAPABILITIES_UPDATE } from 'state/action-types';

const fetchCapabilities = ( action ) =>
	http(
		{
			apiNamespace: 'wpcom/v2',
			method: 'GET',
			path: `/sites/${ action.siteId }/rewind/capabilities`,
			query: {
				force: 'wpcom',
			},
		},
		action
	);

const updateCapabilities = ( { siteId }, data ) => {
	return {
		type: REWIND_CAPABILITIES_UPDATE,
		siteId,
		data: data.capabilities,
	};
};

const onError = ( { siteId } ) => {
	return {
		type: REWIND_CAPABILITIES_UPDATE,
		siteId,
		data: [],
	};
};

registerHandlers( 'state/data-layer/wpcom/sites/rewind/capabilities', {
	[ REWIND_CAPABILITIES_REQUEST ]: [
		dispatchRequest( {
			fetch: fetchCapabilities,
			onSuccess: updateCapabilities,
			onError,
		} ),
	],
} );
