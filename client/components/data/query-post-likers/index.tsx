import { useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { requestPostLikers } from 'calypso/state/posts/likes/actions';

type QueryPostLikersProps = {
	siteId: number | null;
	postId: number | null;
};

/**
 * Component that triggers a data request for the likers of a post.
 */
const QueryPostLikers = ( { siteId, postId }: QueryPostLikersProps ) => {
	const dispatch = useDispatch();

	useEffect( () => {
		if ( siteId && postId ) {
			dispatch( requestPostLikers( siteId, postId ) );
		}
	}, [ dispatch, siteId, postId ] );

	return null;
};

export default QueryPostLikers;
