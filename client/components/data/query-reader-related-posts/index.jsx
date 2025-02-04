import PropTypes from 'prop-types';
import { useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { requestRelatedPosts } from 'calypso/state/reader/related-posts/actions';
import { shouldFetchRelated } from 'calypso/state/reader/related-posts/selectors';
import { SCOPE_ALL, SCOPE_SAME, SCOPE_OTHER } from 'calypso/state/reader/related-posts/utils';

const request = ( siteId, postId, scope, size ) => ( dispatch, getState ) => {
	if ( shouldFetchRelated( getState(), siteId, postId, scope, size ) ) {
		dispatch( requestRelatedPosts( siteId, postId, scope, size ) );
	}
};

export default function QueryReaderRelatedPosts( { siteId, postId, scope = SCOPE_ALL, size = 2 } ) {
	const dispatch = useDispatch();

	useEffect( () => {
		dispatch( request( siteId, postId, scope, size ) );
	}, [ dispatch, siteId, postId, scope, size ] );

	return null;
}

QueryReaderRelatedPosts.propTypes = {
	siteId: PropTypes.number,
	postId: PropTypes.number,
	scope: PropTypes.oneOf( [ SCOPE_ALL, SCOPE_SAME, SCOPE_OTHER ] ),
	size: PropTypes.number,
};
