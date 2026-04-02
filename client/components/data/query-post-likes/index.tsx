import { postLikesQuery } from '@automattic/api-queries';
import { useQuery } from '@tanstack/react-query';
import { useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { receiveLikes } from 'calypso/state/posts/likes/actions';

interface Props {
	siteId: number;
	postId: number;
}

/**
 * Fetches post likes using React Query and bridges the result into Redux for retro-compatibility.
 * @deprecated Use postLikesQuery + useQuery directly in new components.
 */
export default function QueryPostLikes( { siteId, postId }: Props ) {
	const { data, isSuccess } = useQuery( postLikesQuery( siteId, postId ) );
	const dispatch = useDispatch();

	useEffect( () => {
		if ( isSuccess && data ) {
			dispatch( receiveLikes( siteId, postId, data ) );
		}
	}, [ dispatch, siteId, postId, data, isSuccess ] );

	return null;
}
