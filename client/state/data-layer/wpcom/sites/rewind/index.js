/** @format */
/**
 * Internal dependencies
 */
import { mergeHandlers } from 'state/action-watchers/utils';
import { REWIND_STATE_REQUEST, REWIND_STATE_UPDATE } from 'state/action-types';
import { recordTracksEvent, withAnalytics } from 'state/analytics/actions';
import { http } from 'state/data-layer/wpcom-http/actions';
import { dispatchRequestEx, makeParser } from 'state/data-layer/wpcom-http/utils';
import { transformApi } from './api-transformer';
import { rewindStatus } from './schema';

import downloads from './downloads';

const fetchRewindState = action =>
	http(
		{
			apiNamespace: 'wpcom/v2',
			method: 'GET',
			path: `/sites/${ action.siteId }/rewind`,
			query: {
				force: 'wpcom',
			},
		},
		action
	);

const updateRewindState = ( { siteId }, data ) => {
	const stateUpdate = {
		type: REWIND_STATE_UPDATE,
		siteId,
		data,
	};

	const hasRunningRewind = data.rewind && data.rewind.status === 'running';

	if ( ! hasRunningRewind ) {
		return stateUpdate;
	}

	const delayedStateRequest = dispatch =>
		setTimeout(
			() =>
				dispatch( {
					type: REWIND_STATE_REQUEST,
					siteId,
				} ),
			3000
		);

	return [ stateUpdate, delayedStateRequest ];
};

const setUnknownState = ( { siteId }, error ) =>
	withAnalytics(
		recordTracksEvent( 'calypso_rewind_state_parse_error', {
			error: JSON.stringify( error, null, 2 ),
		} ),
		{
			type: REWIND_STATE_UPDATE,
			siteId,
			data: {
				state: 'unknown',
				lastUpdated: new Date(),
			},
		}
	);

export default mergeHandlers( downloads, {
	[ REWIND_STATE_REQUEST ]: [
		dispatchRequestEx( {
			fetch: fetchRewindState,
			onSuccess: updateRewindState,
			onError: setUnknownState,
			fromApi: makeParser( rewindStatus, {}, transformApi ),
		} ),
	],
} );
