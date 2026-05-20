import { readerPostQuery } from '@automattic/api-queries';
import { useQuery } from '@tanstack/react-query';
import { useEffect } from 'react';
import readerContentWidth from 'calypso/reader/lib/content-width';
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

	// Deterministic so that re-runs of the error effect (e.g. when the parent
	// passes a new postKey object literal each render) overwrite the same entry
	// in the posts reducer (keyed by global_ID) instead of accumulating dupes.
	const globalId = `error-${ blogId ?? feedId }-${ postId }`;

	return {
		feed_ID: feedId,
		ID: postId,
		site_ID: blogId,
		is_external: ! blogId,
		global_ID: globalId,
		is_error: true,
		feed_item_ID: postId,
		error,
	};
};

export default function QueryReaderPost( { postKey }: QueryReaderPostProps ) {
	const dispatch = useDispatch();

	// Skip the network call when the post is already populated in Redux with
	// renderable content (e.g. by a stream response that included excerpts).
	// Stream items dispatched through `receivePosts` no longer carry the legacy
	// `_state: 'minimal'` flag, so detect "needs full fetch" by the absence of
	// any renderable body field — otherwise the full-post view would render a
	// stream-card-shaped post forever.
	const cachedPost = useSelector( ( state ) => getPostByKey( state, postKey ) );
	const hasRenderablePostContent = !! (
		cachedPost?.content ||
		cachedPost?.excerpt ||
		cachedPost?.better_excerpt ||
		cachedPost?.use_excerpt
	);
	const shouldFetch =
		! cachedPost ||
		cachedPost._state === 'minimal' ||
		( ! cachedPost.is_error && ! hasRenderablePostContent );

	const queryOptions = readerPostQuery( postKey, readerContentWidth() );
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
