/** @format */
/**
 * External Dependencies
 */
import { filter, map } from 'lodash';

/**
 * Internal Dependencies
 */
import {
	READER_RELATED_POSTS_REQUEST,
	READER_RELATED_POSTS_REQUEST_SUCCESS,
	READER_RELATED_POSTS_REQUEST_FAILURE,
	READER_RELATED_POSTS_RECEIVE,
	READER_SITE_UPDATE,
} from 'state/action-types';
import { receivePosts } from 'state/reader/posts/actions';
import wpcom from 'lib/wp';
import { SCOPE_ALL, SCOPE_SAME, SCOPE_OTHER } from './utils';
import { getDefaultSearchAlgorithm } from 'reader/search-helper';

export function requestRelatedPosts( siteId, postId, scope = SCOPE_ALL ) {
	return function( dispatch ) {
		dispatch( { type: READER_RELATED_POSTS_REQUEST, payload: { siteId, postId, scope } } );

		const query = { site_id: siteId, post_id: postId, meta: 'site' };

		if ( scope === SCOPE_SAME ) {
			query.size_local = 2;
			query.size_global = 0;
		} else if ( scope === SCOPE_OTHER ) {
			query.size_local = 0;
			query.size_global = 2;
		}

		if ( getDefaultSearchAlgorithm() ) {
			query.algorithm = getDefaultSearchAlgorithm();
		}

		return wpcom
			.undocumented()
			.readSitePostRelated( query )
			.then(
				response => {
					dispatch( {
						type: READER_RELATED_POSTS_REQUEST_SUCCESS,
						payload: { siteId, postId, scope },
					} );
					const sites = filter( map( response && response.posts, 'meta.data.site' ), Boolean );
					if ( sites && sites.length !== 0 ) {
						dispatch( { type: READER_SITE_UPDATE, payload: sites } );
					}
					// collect posts and dispatch
					dispatch( receivePosts( response && response.posts ) ).then( () => {
						dispatch( {
							type: READER_RELATED_POSTS_RECEIVE,
							payload: {
								siteId,
								postId,
								scope,
								posts: ( response && response.posts ) || [],
							},
						} );
					} );
				},
				err => {
					dispatch( {
						type: READER_RELATED_POSTS_REQUEST_FAILURE,
						payload: { siteId, postId, scope, error: err },
						error: true,
					} );

					dispatch( {
						type: READER_RELATED_POSTS_RECEIVE,
						payload: {
							siteId,
							postId,
							scope,
							posts: [],
						},
					} );
				}
			);
	};
}
