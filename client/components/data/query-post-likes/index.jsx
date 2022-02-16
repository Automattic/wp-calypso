import PropTypes from 'prop-types';
import { useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { useInterval } from 'calypso/lib/interval';
import { requestPostLikes } from 'calypso/state/posts/likes/actions';
import { getPostLikeLastUpdated } from 'calypso/state/posts/selectors/get-post-like-last-updated';
import { getPostLikes } from 'calypso/state/posts/selectors/get-post-likes';

const request = ( siteId, postId, maxAgeMs, needsLikers ) => ( dispatch, getState ) => {
	const state = getState();
	const lastUpdated = getPostLikeLastUpdated( state, siteId, postId );
	const hasPostLikes = getPostLikes( state, siteId, postId ) !== null;

	if ( ! lastUpdated || Date.now() - lastUpdated > maxAgeMs || ( needsLikers && ! hasPostLikes ) ) {
		dispatch( requestPostLikes( siteId, postId ) );
	}
};

function QueryPostLikes( { siteId, postId, maxAgeSeconds = 120, needsLikers = false } ) {
	const dispatch = useDispatch();
	const maxAgeMs = maxAgeSeconds * 1000;

	useInterval( () => {
		if ( siteId && postId ) {
			dispatch( request( siteId, postId, maxAgeMs, needsLikers ) );
		}
	}, maxAgeMs + 1 );

	useEffect( () => {
		if ( siteId && postId ) {
			dispatch( request( siteId, postId, maxAgeMs, needsLikers ) );
		}
	}, [ dispatch, siteId, postId, maxAgeMs, needsLikers ] );

	return null;
}

QueryPostLikes.propTypes = {
	siteId: PropTypes.number.isRequired,
	postId: PropTypes.number.isRequired,
	needsLikers: PropTypes.bool,
	maxAgeSeconds: PropTypes.number, // max age of likes data in milliseconds
};

export default QueryPostLikes;
