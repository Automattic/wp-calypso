import { registerHandlers } from 'calypso/state/data-layer/handler-registry';
import { dispatchRequest } from 'calypso/state/data-layer/wpcom-http/utils';
import {
	READER_STREAMS_PAGE_REQUEST,
	READER_STREAMS_PAGINATED_REQUEST,
} from 'calypso/state/reader/action-types';
import {
	PER_FETCH,
	INITIAL_FETCH,
	QUERY_META,
	SITE_LIMITER_FIELDS,
} from 'calypso/state/reader/streams/normalize';

// Re-exported for legacy consumers (e.g. client/reader/stream/index.jsx).
export { PER_FETCH, INITIAL_FETCH, QUERY_META, SITE_LIMITER_FIELDS };

const noop = () => {};

/**
 * The Reader stream fetch path has moved to
 * `client/state/reader/streams/actions.js` + React Query. Keep this data-layer
 * handler registered as a no-op while legacy imports and request actions are
 * still being cleaned up.
 * @returns {undefined}
 */
export function requestPage() {
	return;
}

registerHandlers( 'state/data-layer/wpcom/read/streams/index.js', {
	[ READER_STREAMS_PAGE_REQUEST ]: [
		dispatchRequest( {
			fetch: requestPage,
			onSuccess: noop,
			onError: noop,
		} ),
	],
	[ READER_STREAMS_PAGINATED_REQUEST ]: [
		dispatchRequest( {
			fetch: requestPage,
			onSuccess: noop,
			onError: noop,
		} ),
	],
} );
