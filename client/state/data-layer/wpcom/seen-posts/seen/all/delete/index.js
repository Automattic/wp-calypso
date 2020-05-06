/**
 * Internal Dependencies
 */
import { http } from 'state/data-layer/wpcom-http/actions';
import { dispatchRequest } from 'state/data-layer/wpcom-http/utils';
import { registerHandlers } from 'state/data-layer/handler-registry';
import { receiveMarkAllAsUnseen } from 'state/reader/seen-posts/actions';
import { requestUnseenStatusAny } from 'state/ui/reader/seen-posts/actions';
import { READER_SEEN_MARK_ALL_AS_UNSEEN_REQUEST } from 'state/reader/action-types';

const toApi = ( action ) => {
	return {
		section: action.section,
	};
};

export function fetch( action ) {
	return http(
		{
			method: 'POST',
			apiNamespace: 'wpcom/v2',
			path: `/seen-posts/seen/all/delete`,
			body: toApi( action ),
		},
		action
	);
}

// need to dispatch multiple times so use a redux-thunk
export const onSuccess = ( action, response ) => ( dispatch ) => {
	if ( response.status ) {
		dispatch( receiveMarkAllAsUnseen( { section: action.section } ) );
	}

	// re-request unseen statuses
	dispatch( requestUnseenStatusAny() );
};

export function onError() {
	// don't do much
	return [];
}

registerHandlers( 'state/data-layer/wpcom/seen-posts/seen/all/delete/index.js', {
	[ READER_SEEN_MARK_ALL_AS_UNSEEN_REQUEST ]: [
		dispatchRequest( {
			fetch,
			onSuccess,
			onError,
		} ),
	],
} );
