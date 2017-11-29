/** @format */
/**
 * Internal dependencies
 */
import { mergeHandlers } from 'state/action-watchers/utils';
import { REWIND_STATE_REQUEST, REWIND_STATE_UPDATE } from 'state/action-types';
import { http } from 'state/data-layer/wpcom-http/actions';
import { dispatchRequestEx, makeParser } from 'state/data-layer/wpcom-http/utils';
import { transformApi } from './api-transformer';
import { rewind } from './schema';

import downloads from './downloads';

const fetchRewindState = action =>
	http(
		{
			apiVersion: '1.1',
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
	...data,
} );

export default mergeHandlers( downloads, {
	[ REWIND_STATE_REQUEST ]: [
		dispatchRequestEx( {
			fetch: fetchRewindState,
			onSuccess: updateRewindState,
			fromApi: makeParser( rewind, {}, transformApi ),
		} ),
	],
} );
