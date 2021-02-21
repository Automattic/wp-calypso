/**
 * External dependencies
 */
import { useEffect } from 'react';
import { useDispatch } from 'react-redux';
import PropTypes from 'prop-types';

/**
 * Internal dependencies
 */
import { shouldFetchRelated } from 'calypso/state/reader/related-posts/selectors';
import { requestRelatedPosts } from 'calypso/state/reader/related-posts/actions';
import { SCOPE_ALL, SCOPE_SAME, SCOPE_OTHER } from 'calypso/state/reader/related-posts/utils';

const request = ( siteId, postId, scope ) => ( dispatch, getState ) => {
	if ( shouldFetchRelated( getState(), siteId, postId, scope ) ) {
		dispatch( requestRelatedPosts( siteId, postId, scope ) );
	}
};

export default function QueryReaderRelatedPosts( { siteId, postId, scope = SCOPE_ALL } ) {
	const dispatch = useDispatch();

	useEffect( () => {
		dispatch( request( siteId, postId, scope ) );
	}, [ dispatch, siteId, postId, scope ] );

	return null;
}

QueryReaderRelatedPosts.propTypes = {
	siteId: PropTypes.number,
	postId: PropTypes.number,
	scope: PropTypes.oneOf( [ SCOPE_ALL, SCOPE_SAME, SCOPE_OTHER ] ),
};
