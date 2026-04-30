import { readerPostQuery } from '@automattic/api-queries';
import { useQuery } from '@tanstack/react-query';
import { useEffect } from 'react';
import { useDispatch } from 'calypso/state';
import { receivePosts } from 'calypso/state/reader/posts/actions';
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
	const { data, isError, error } = useQuery( readerPostQuery( postKey ) );

	const handleSuccess = () => {
		if ( data ) {
			dispatch( receivePosts( [ data ] ) );
		}
	};

	const handleError = () => {
		if ( ! isError || ! postKey ) {
			return;
		}
		dispatch( receivePosts( [ buildErrorPost( postKey, error ) ] ) );
	};

	useEffect( handleSuccess, [ data, dispatch ] );
	useEffect( handleError, [ isError, error, postKey, dispatch ] );

	return null;
}
