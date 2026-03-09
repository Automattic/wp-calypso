import { readSitePostQuery, readFeedPostQuery } from '@automattic/api-queries';
import { useQuery } from '@tanstack/react-query';
import { useEffect } from 'react';
import readerContentWidth from 'calypso/reader/lib/content-width';
import { useDispatch } from 'calypso/state';
import { receivePosts, receiveErrorForPostKey } from 'calypso/state/reader/posts/actions';

interface Props {
	postKey: { blogId?: number; postId: number; feedId?: number };
}

export const QueryReaderPost = ( { postKey }: Props ) => {
	const dispatch = useDispatch();
	const { blogId, postId, feedId, ...params } = postKey;
	const renderContentWidth = readerContentWidth();
	const query = {
		...params,
		content_width: renderContentWidth,
	};

	const queryOption = blogId
		? readSitePostQuery( blogId, postId, query )
		: readFeedPostQuery( feedId!, postId, query );

	const { data, isSuccess, error: postError } = useQuery( queryOption );

	useEffect( () => {
		if ( isSuccess ) {
			dispatch( receivePosts( [ data ] ) );
		}
	}, [ isSuccess, postKey, dispatch, data ] );

	useEffect( () => {
		if ( postError ) {
			dispatch( receiveErrorForPostKey( postError, postKey ) );
		}
	}, [ postError, postKey, dispatch ] );

	return null;
};
