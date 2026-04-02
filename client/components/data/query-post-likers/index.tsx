import { postLikesQuery } from '@automattic/api-queries';
import { useQuery } from '@tanstack/react-query';
import { useEffect } from 'react';
import { useDispatch } from 'calypso/state';
import { receivePostLikers } from 'calypso/state/posts/likes/actions';

type QueryPostLikersProps = {
	siteId: number | null;
	postId: number | null;
};

const REFETCH_INTERVAL = 1000 * 120; // 2 minutes

/**
 * Fetches post likes using React Query and bridges the liker list into Redux
 * for retro-compatibility.
 */
const QueryPostLikers = ( { siteId, postId }: QueryPostLikersProps ) => {
	const { data, isSuccess } = useQuery( {
		...postLikesQuery( siteId, postId ),
		refetchInterval: REFETCH_INTERVAL,
	} );

	const dispatch = useDispatch();

	useEffect( () => {
		if ( ! siteId || ! postId ) {
			return;
		}

		if ( ! isSuccess || ! data ) {
			return;
		}

		dispatch( receivePostLikers( siteId, postId, { likes: data.likes, found: data.found } ) );
	}, [ dispatch, siteId, postId, data, isSuccess ] );

	return null;
};

export default QueryPostLikers;
