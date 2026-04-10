import { postLikesQuery } from '@automattic/api-queries';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useEffect, useRef } from 'react';
import { useDispatch } from 'react-redux';
import { useSelector } from 'calypso/state';
import { receiveLikes } from 'calypso/state/posts/likes/actions';
import { getPostLikeCount } from 'calypso/state/posts/selectors/get-post-like-count';
import { isLikedPost } from 'calypso/state/posts/selectors/is-liked-post';

interface Props {
	siteId: number;
	postId: number;
}

/**
 * Fetches post likes using React Query and bridges the result into Redux for retro-compatibility.
 * @deprecated Use postLikesQuery + useQuery directly in new components.
 */
export default function QueryPostLikes( { siteId, postId }: Props ) {
	const queryClient = useQueryClient();
	const { data, isSuccess } = useQuery( postLikesQuery( siteId, postId ) );
	const dispatch = useDispatch();

	// Track the last values that came from React Query so we can detect
	// when Redux diverges due to a local like/unlike optimistic update.
	const dataRef = useRef< { iLike: boolean; found: number } | undefined >();

	useEffect( () => {
		if ( isSuccess && data ) {
			dataRef.current = { iLike: data.iLike, found: data.found };
			dispatch( receiveLikes( siteId, postId, data ) );
		}
	}, [ dispatch, siteId, postId, data, isSuccess ] );

	// Invalidate the React Query cache when a local like/unlike action causes
	// Redux state to diverge from what React Query last returned.
	const iLike = useSelector( ( state ) => isLikedPost( state, siteId, postId ) );
	const found = useSelector( ( state ) => getPostLikeCount( state, siteId, postId ) );

	useEffect( () => {
		if (
			dataRef.current !== undefined &&
			( iLike !== dataRef.current.iLike || found !== dataRef.current.found )
		) {
			queryClient.invalidateQueries( {
				queryKey: postLikesQuery( siteId, postId ).queryKey,
			} );
		}
	}, [ iLike, found, queryClient, siteId, postId ] );

	return null;
}
