import { translate } from 'i18n-calypso';
import {
	EDGE_CACHE_ACTIVE_REQUEST,
	EDGE_CACHE_ACTIVE_SET_REQUEST,
	EDGE_CACHE_ACTIVE_SET,
} from 'calypso/state/action-types';
import { registerHandlers } from 'calypso/state/data-layer/handler-registry';
import { http } from 'calypso/state/data-layer/wpcom-http/actions';
import { dispatchRequest } from 'calypso/state/data-layer/wpcom-http/utils';
import { errorNotice, successNotice } from 'calypso/state/notices/actions';

const updateNoticeId = 'edge-cache-active';

const getActive = ( action ) =>
	http(
		{
			method: 'GET',
			path: `/sites/${ action.siteId }/edge-cache/active`,
			apiNamespace: 'wpcom/v2',
			body: {},
		},
		action
	);

const getActiveSuccess = ( action, active ) => {
	return {
		type: EDGE_CACHE_ACTIVE_SET,
		siteId: action.siteId,
		active,
	};
};

const setActive = ( action ) =>
	http(
		{
			method: 'POST',
			path: `/sites/${ action.siteId }/edge-cache/active`,
			apiNamespace: 'wpcom/v2',
			body: {
				active: action.active,
			},
		},
		action
	);

const setActiveSuccess = ( action ) => {
	let message = translate( 'Edge cache successfully enabled.' );
	if ( action.active === 0 ) {
		message = translate( 'Edge cache successfully disabled.' );
	}

	return [
		{
			type: EDGE_CACHE_ACTIVE_SET,
			siteId: action.siteId,
			active: action.active,
		},
		successNotice( message, {
			id: updateNoticeId,
			showDismiss: false,
			duration: 5000,
		} ),
	];
};

const setActiveError = ( action ) => {
	let message = translate( 'Failed to enable edge cache.' );
	if ( action.active === 0 ) {
		message = translate( 'Failed to disable edge cache.' );
	}

	return [
		errorNotice( message, {
			id: updateNoticeId,
		} ),
	];
};

registerHandlers( 'state/data-layer/wpcom/sites/edge-cache/active.js', {
	[ EDGE_CACHE_ACTIVE_SET_REQUEST ]: [
		dispatchRequest( {
			fetch: setActive,
			onSuccess: setActiveSuccess,
			onError: setActiveError,
		} ),
	],
	[ EDGE_CACHE_ACTIVE_REQUEST ]: [
		dispatchRequest( {
			fetch: getActive,
			onSuccess: getActiveSuccess,
		} ),
	],
} );
