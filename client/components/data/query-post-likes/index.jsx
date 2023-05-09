import PropTypes from 'prop-types';
import { useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { useInterval } from 'calypso/lib/interval';
import { requestPostLikes } from 'calypso/state/posts/likes/actions';
import { getPostLikeLastUpdated } from 'calypso/state/posts/selectors/get-post-like-last-updated';
import { getPostLikes } from 'calypso/state/posts/selectors/get-post-likes';

const MAX_AGE_MS = 120 * 1000;

const request = ( siteId, postId, needsLikers ) => ( dispatch, getState ) => {
	const state = getState();
	const lastUpdated = getPostLikeLastUpdated( state, siteId, postId );
	const hasPostLikes = getPostLikes( state, siteId, postId ) !== null;

	if (
		! lastUpdated ||
		Date.now() - lastUpdated > MAX_AGE_MS ||
		( needsLikers && ! hasPostLikes )
	) {
		dispatch( requestPostLikes( siteId, postId ) );
	}
};

function QueryPostLikes( { siteId, postId, needsLikers = false } ) {
	const dispatch = useDispatch();

	useInterval( () => {
		if ( siteId && postId ) {
			dispatch( request( siteId, postId, needsLikers ) );
		}
	}, MAX_AGE_MS + 1 );

	useEffect( () => {
		if ( siteId && postId ) {
			dispatch( request( siteId, postId, needsLikers ) );
		}
	}, [ dispatch, siteId, postId, needsLikers ] );

	return null;
}

QueryPostLikes.propTypes = {
	siteId: PropTypes.number.isRequired,
	postId: PropTypes.number.isRequired,
	needsLikers: PropTypes.bool,
};

export default QueryPostLikes;
