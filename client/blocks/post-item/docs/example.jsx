/**
 * External dependencies
 */
import { get } from 'lodash';
import React from 'react';
import { connect } from 'react-redux';

/**
 * Internal dependencies
 */
import PostItem from '../';
import QueryPosts from 'components/data/query-posts';
import QuerySites from 'components/data/query-sites';
import { getCurrentUser } from 'state/current-user/selectors';
import { getSitePosts } from 'state/posts/selectors';

function PostItemExample( { primarySiteId, globalId } ) {
	return (
		<div>
			{ primarySiteId && <QuerySites siteId={ primarySiteId } /> }

			{ primarySiteId && (
				<QueryPosts
					siteId={ primarySiteId }
					query={ { number: 1, type: 'any' } } />
			) }
			<div>
				<strong>Standard</strong>
				{ ! globalId && <em style={ { display: 'block' } }>No posts found</em> }
				{ globalId && <PostItem globalId={ globalId } /> }
			</div>
			<div>
				<strong>Placeholder</strong>
				<PostItem />
			</div>
		</div>
	);
}

const ConnectedPostItemExample = connect( ( state ) => {
	const primarySiteId = get( getCurrentUser( state ), 'primary_blog' );

	return {
		primarySiteId,
		globalId: get( getSitePosts( state, primarySiteId ), [ 0, 'global_ID' ] )
	};
} )( PostItemExample );

ConnectedPostItemExample.displayName = 'PostItem';

export default ConnectedPostItemExample;
