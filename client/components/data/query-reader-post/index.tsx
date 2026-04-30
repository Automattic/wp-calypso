import { readerPostQuery } from '@automattic/api-queries';
import { useQuery } from '@tanstack/react-query';
import { useEffect } from 'react';
import { useDispatch, useSelector } from 'calypso/state';
import { READER_POSTS_RECEIVE } from 'calypso/state/reader/action-types';
import { receivePosts } from 'calypso/state/reader/posts/actions';
import { getPostByKey } from 'calypso/state/reader/posts/selectors';
import type { ReadPostKey } from '@automattic/api-core';

interface QueryReaderPostProps {
	postKey: Partial< ReadPostKey > | null | undefined;
}

const buildErrorPost = ( postKey: Partial< ReadPostKey >, error: unknown ) => {
	const blogId = ( postKey as { blogId?: number } ).blogId;
	const feedId = ( postKey as { feedId?: number } ).feedId;
	const postId = postKey.postId as number | undefined;

	return {
		feed_ID: feedId,
		ID: postId,
		site_ID: blogId,
		is_external: ! blogId,
		global_ID: crypto.randomUUID(),
		is_error: true,
		feed_item_ID: postId,
		error,
	};
};

export default function QueryReaderPost( { postKey }: QueryReaderPostProps ) {
	const dispatch = useDispatch();

	// Skip the network call when the post is already populated in Redux (e.g. by
	// a stream response). Mirrors the legacy `! post || post._state === 'minimal'`
	// guard and keeps the bridge cheap for consumers that mount it unconditionally.
	const cachedPost = useSelector( ( state ) => getPostByKey( state, postKey ) );
	const shouldFetch = ! cachedPost || cachedPost._state === 'minimal';

	const queryOptions = readerPostQuery( postKey );
	const { data, isError, error } = useQuery( {
		...queryOptions,
		enabled: queryOptions.enabled !== false && shouldFetch,
	} );

	const handleSuccess = () => {
		if ( data ) {
			dispatch( receivePosts( [ data ] ) );
		}
	};

	// Dispatch the raw action to bypass `receivePosts`' normalization and
	// `receiveLikes` side effects, which don't apply to a post that never loaded.
	const handleError = () => {
		if ( ! isError || ! postKey ) {
			return;
		}
		dispatch( {
			type: READER_POSTS_RECEIVE,
			posts: [ buildErrorPost( postKey, error ) ],
		} );
	};

	useEffect( handleSuccess, [ data, dispatch ] );
	useEffect( handleError, [ isError, error, postKey, dispatch ] );

	return null;
}
