import { registerHandlers } from 'calypso/state/data-layer/handler-registry';
import { http } from 'calypso/state/data-layer/wpcom-http/actions';
import { dispatchRequest } from 'calypso/state/data-layer/wpcom-http/utils';
import {
	READER_USER_LISTS_REQUEST,
	READER_USER_LISTS_RECEIVE,
} from 'calypso/state/reader/action-types';

const noop = () => {};

registerHandlers( 'state/data-layer/wpcom/read/lists/index.js', {
	// Request only public lists for a specific user
	[ READER_USER_LISTS_REQUEST ]: [
		dispatchRequest( {
			fetch: ( action ) =>
				http(
					{
						method: 'GET',
						path: `/read/lists/${ action.userLogin }`,
						apiVersion: '1',
					},
					action
				),
			onSuccess: ( action, apiResponse ) => ( {
				type: READER_USER_LISTS_RECEIVE,
				userLogin: action.userLogin,
				lists: apiResponse?.lists,
			} ),
			onError: () => noop,
		} ),
	],
} );
