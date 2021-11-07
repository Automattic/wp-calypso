import {
	REWIND_SIZE_REQUEST,
	REWIND_SIZE_REQUEST_FAILURE,
	REWIND_SIZE_REQUEST_SUCCESS,
	REWIND_SIZE_SET,
} from 'calypso/state/action-types';
import { registerHandlers } from 'calypso/state/data-layer/handler-registry';
import { http } from 'calypso/state/data-layer/wpcom-http/actions';
import { dispatchRequest } from 'calypso/state/data-layer/wpcom-http/utils';
import fromApi from './from-api';
import type { RewindSizeInfo } from 'calypso/state/rewind/size/types';
import type { AnyAction } from 'redux';

type RequestActionType = AnyAction & {
	siteId: number;
};

export const fetch = ( action: RequestActionType ) =>
	http(
		{
			apiNamespace: 'wpcom/v2',
			method: 'GET',
			path: `/sites/${ action.siteId }/rewind/size`,
			query: {
				force: 'wpcom',
			},
		},
		action
	);

const onSuccess = ( { siteId }: RequestActionType, size: RewindSizeInfo ) => [
	{
		type: REWIND_SIZE_REQUEST_SUCCESS,
		siteId,
	},
	{
		type: REWIND_SIZE_SET,
		siteId,
		size,
	},
];

const onError = ( { siteId }: RequestActionType, error: string ) => ( {
	type: REWIND_SIZE_REQUEST_FAILURE,
	siteId,
	error,
} );

registerHandlers( 'state/data-layer/wpcom/sites/rewind/size', {
	[ REWIND_SIZE_REQUEST ]: [
		dispatchRequest( {
			fetch,
			fromApi,
			onSuccess,
			onError,
		} ),
	],
} );
