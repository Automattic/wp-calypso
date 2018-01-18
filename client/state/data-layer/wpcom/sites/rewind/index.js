/** @format */
/**
 * Internal dependencies
 */
import { mergeHandlers } from 'state/action-watchers/utils';
import {
	JETPACK_CREDENTIALS_AUTOCONFIGURE,
	JETPACK_CREDENTIALS_DELETE,
	JETPACK_CREDENTIALS_UPDATE,
	REWIND_STATE_REQUEST,
	REWIND_STATE_UPDATE,
} from 'state/action-types';
import { recordTracksEvent, withAnalytics } from 'state/analytics/actions';
import { requestRewindState } from 'state/rewind/actions';
import { http } from 'state/data-layer/wpcom-http/actions';
import {
	dispatchRequestEx,
	getData,
	getError,
	makeParser,
} from 'state/data-layer/wpcom-http/utils';
import { transformApi } from './api-transformer';
import { rewind } from './schema';

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

const updateRewindState = ( { siteId }, data ) => ( {
	type: REWIND_STATE_UPDATE,
	siteId,
	data,
} );

const setUnknownState = ( { siteId }, error ) =>
	withAnalytics(
		recordTracksEvent( 'rewind_state_parse_error', {
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

/*
 * In response to network activity for the watched types
 * Also update the Rewind state to see changes
 */
const alsoUpdateRewindState = ( { dispatch }, action ) =>
	getData( action ) || getError( action )
		? dispatch( requestRewindState( action.siteId ) )
		: undefined;

export default mergeHandlers( downloads, {
	[ JETPACK_CREDENTIALS_AUTOCONFIGURE ]: [ alsoUpdateRewindState ],
	[ JETPACK_CREDENTIALS_DELETE ]: [ alsoUpdateRewindState ],
	[ JETPACK_CREDENTIALS_UPDATE ]: [ alsoUpdateRewindState ],
	[ REWIND_STATE_REQUEST ]: [
		dispatchRequestEx( {
			fetch: fetchRewindState,
			onSuccess: updateRewindState,
			onError: setUnknownState,
			fromApi: makeParser( rewind, {}, transformApi ),
		} ),
	],
} );
