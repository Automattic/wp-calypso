/**
 * External dependencies
 */
import React from 'react';
import { connect } from 'react-redux';
import { get } from 'lodash';

/**
 * Internal dependencies
 */
import QueryPosts from 'components/data/query-posts';
import Card from 'components/card';
import PostRelativeTime from '../';
import { getCurrentUser } from 'state/current-user/selectors';
import { getSitePosts } from 'state/posts/selectors';

function PostRelativeTimeExample( { primarySiteId, primarySiteUrl, globalId } ) {
	return (
		<div className="docs__design-assets-group">
			<h2>
				<a href="/devdocs/blocks/post-relative-time">Post Relative Time</a>
			</h2>
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
				{ globalId && <PostRelativeTime globalId={ globalId } /> }
			</Card>
		</div>
	);
}

const ConnectedPostRelativeTimeExample = connect( ( state ) => {
	const user = getCurrentUser( state );
	const primarySiteId = get( user, 'primary_blog' );

	return {
		primarySiteId,
		primarySiteUrl: get( user, 'primary_blog_url' ),
		globalId: get( getSitePosts( state, primarySiteId ), [ 0, 'global_ID' ] )
	};
} )( PostRelativeTimeExample );

ConnectedPostRelativeTimeExample.displayName = 'PostRelativeTime';

export default ConnectedPostRelativeTimeExample;
