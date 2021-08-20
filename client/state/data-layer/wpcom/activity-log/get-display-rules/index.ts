/**
 * Internal dependencies
 */
import {
	ACTIVITY_LOG_DISPLAY_RULES_REQUEST,
	ACTIVITY_LOG_DISPLAY_RULES_REQUEST_FAILURE,
	ACTIVITY_LOG_DISPLAY_RULES_REQUEST_SUCCESS,
	ACTIVITY_LOG_DISPLAY_RULES_SET,
} from 'calypso/state/action-types';
import { registerHandlers } from 'calypso/state/data-layer/handler-registry';
import { http } from 'calypso/state/data-layer/wpcom-http/actions';
import { dispatchRequest } from 'calypso/state/data-layer/wpcom-http/utils';

const fetch = ( action ) =>
	http(
		{
			apiNamespace: 'wpcom/v2',
			method: 'GET',
			path: `/sites/${ action.siteId }/activity/display-rules`,
			query: {
				force: 'wpcom',
			},
		},
		action
	);

const onSuccess = ( { siteId }, { display_rules: displayRules } ) => [
	{
		type: ACTIVITY_LOG_DISPLAY_RULES_REQUEST_SUCCESS,
		siteId,
	},
	{
		type: ACTIVITY_LOG_DISPLAY_RULES_SET,
		siteId,
		displayRules,
	},
];

const onError = ( { siteId } ) => ( {
	type: ACTIVITY_LOG_DISPLAY_RULES_REQUEST_FAILURE,
	siteId,
} );

registerHandlers( 'state/data-layer/wpcom/activity-log/get-display-rules', {
	[ ACTIVITY_LOG_DISPLAY_RULES_REQUEST ]: [
		dispatchRequest( {
			fetch,
			onSuccess,
			onError,
		} ),
	],
} );
