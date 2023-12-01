import PropTypes from 'prop-types';
import { useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { useInterval } from 'calypso/lib/interval';
import { requestPostLikes } from 'calypso/state/posts/likes/actions';
import { getPostLikeLastUpdated } from 'calypso/state/posts/selectors/get-post-like-last-updated';

const MAX_AGE_MS = 120 * 1000;

const request = ( siteId, postId ) => ( dispatch, getState ) => {
	const state = getState();
	const lastUpdated = getPostLikeLastUpdated( state, siteId, postId );

	if ( ! lastUpdated || Date.now() - lastUpdated > MAX_AGE_MS ) {
		dispatch( requestPostLikes( siteId, postId ) );
	}
};

function QueryPostLikes( { siteId, postId } ) {
	const dispatch = useDispatch();

	useInterval( () => {
		if ( siteId && postId ) {
			dispatch( request( siteId, postId ) );
		}
	}, MAX_AGE_MS + 1 );

	useEffect( () => {
		if ( siteId && postId ) {
			dispatch( request( siteId, postId ) );
		}
	}, [ dispatch, siteId, postId ] );

	return null;
}

QueryPostLikes.propTypes = {
	siteId: PropTypes.number.isRequired,
	postId: PropTypes.number.isRequired,
};

export default QueryPostLikes;
