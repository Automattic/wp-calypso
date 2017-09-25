/**
 * External dependencies
 */
import { get } from 'lodash';
import React from 'react';
import { connect } from 'react-redux';

/**
 * Internal dependencies
 */
import PostTime from '../';
import Card from 'components/card';
import QueryPosts from 'components/data/query-posts';
import { getCurrentUser } from 'state/current-user/selectors';
import { getSitePosts } from 'state/posts/selectors';

function PostTimeExample( { primarySiteId, primarySiteUrl, globalId } ) {
	return (
		<Card>
			{ primarySiteUrl && (
				<p><small>Example uses result from primary site <strong>{ primarySiteUrl }</strong></small></p>
			) }
			{ primarySiteId && (
				<QueryPosts
					siteId={ primarySiteId }
					query={ { number: 1, type: 'any' } } />
			) }
			{ ! globalId && <em>No matching post found</em> }
			{ globalId && <PostTime globalId={ globalId } /> }
		</Card>
	);
}

const ConnectedPostTimeExample = connect( ( state ) => {
	const user = getCurrentUser( state );
	const primarySiteId = get( user, 'primary_blog' );

	return {
		primarySiteId,
		primarySiteUrl: get( user, 'primary_blog_url' ),
		globalId: get( getSitePosts( state, primarySiteId ), [ 0, 'global_ID' ] )
	};
} )( PostTimeExample );

ConnectedPostTimeExample.displayName = 'PostTime';

export default ConnectedPostTimeExample;
