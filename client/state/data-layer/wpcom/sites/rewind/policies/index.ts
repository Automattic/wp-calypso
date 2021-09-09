import {
	REWIND_POLICIES_REQUEST,
	REWIND_POLICIES_REQUEST_FAILURE,
	REWIND_POLICIES_REQUEST_SUCCESS,
	REWIND_POLICIES_SET,
} from 'calypso/state/action-types';
import { registerHandlers } from 'calypso/state/data-layer/handler-registry';
import { http } from 'calypso/state/data-layer/wpcom-http/actions';
import { dispatchRequest } from 'calypso/state/data-layer/wpcom-http/utils';
import fromApi from './from-api';
import type { RewindPolicies } from 'calypso/state/rewind/policies/types';
import type { AnyAction } from 'redux';

type RequestActionType = AnyAction & {
	siteId: number;
};

const fetch = ( action: RequestActionType ) =>
	http(
		{
			apiNamespace: 'wpcom/v2',
			method: 'GET',
			path: `/sites/${ action.siteId }/rewind/policies`,
			query: {
				force: 'wpcom',
			},
		},
		action
	);

const onSuccess = ( { siteId }: RequestActionType, policies: RewindPolicies ) => [
	{
		type: REWIND_POLICIES_REQUEST_SUCCESS,
		siteId,
	},
	{
		type: REWIND_POLICIES_SET,
		siteId,
		policies,
	},
];

const onError = ( { siteId }: RequestActionType ) => ( {
	type: REWIND_POLICIES_REQUEST_FAILURE,
	siteId,
} );

registerHandlers( 'state/data-layer/wpcom/sites/rewind/policies', {
	[ REWIND_POLICIES_REQUEST ]: [
		dispatchRequest( {
			fetch,
			fromApi,
			onSuccess,
			onError,
		} ),
	],
} );
