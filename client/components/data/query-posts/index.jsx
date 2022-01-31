import isShallowEqual from '@wordpress/is-shallow-equal';
import debug from 'debug';
import { useEffect, useRef } from 'react';
import { useDispatch } from 'react-redux';
import {
	requestSitePosts,
	requestSitePost,
	requestAllSitesPosts,
} from 'calypso/state/posts/actions';
import { isRequestingPostsForQuery, isRequestingSitePost } from 'calypso/state/posts/selectors';

/**
 * Module variables
 */
const log = debug( 'calypso:query-posts' );

const useMemoizedQuery = ( query ) => {
	const memoizedQuery = useRef();
	if ( ! isShallowEqual( query, memoizedQuery.current ) ) {
		memoizedQuery.current = query;
	}
	return memoizedQuery.current;
};

const request = ( siteId, postId, query ) => ( dispatch, getState ) => {
	const state = getState();

	if ( ! siteId && ! isRequestingPostsForQuery( state, null, query ) ) {
		log( 'Request post list for all sites using query %o', query );
		dispatch( requestAllSitesPosts( query ) );
		return;
	}

	if ( ! postId && ! isRequestingPostsForQuery( state, siteId, query ) ) {
		log( 'Request post list for site %d using query %o', siteId, query );
		dispatch( requestSitePosts( siteId, query ) );
		return;
	}

	if ( ! isRequestingSitePost( state, siteId, postId ) ) {
		log( 'Request single post for site %d post %d', siteId, postId );
		dispatch( requestSitePost( siteId, postId ) );
	}
};

function QueryPosts( { siteId, postId, query } ) {
	const dispatch = useDispatch();
	const memoizedQuery = useMemoizedQuery( query );

	useEffect( () => {
		dispatch( request( siteId, postId, memoizedQuery ) );
	}, [ dispatch, siteId, postId, memoizedQuery ] );

	return null;
}

export default QueryPosts;
