/**
 * External dependencies
 */
import React from 'react';
import { connect } from 'react-redux';
import { map, mapValues, get } from 'lodash';

/**
 * Internal dependencies
 */
import QueryPosts from 'components/data/query-posts';
import Card from 'components/card';
import PostStatus from '../';
import { getCurrentUser } from 'state/current-user/selectors';
import { getSitePostsForQuery } from 'state/posts/selectors';

function PostStatusExample( { queries, primarySiteId, primarySiteUrl, globalIdByQueryLabel } ) {
	return (
		<div className="docs__design-assets-group">
			<h2>
				<a href="/devdocs/blocks/post-status">Post Status</a>
			</h2>
			<Card>
				{ primarySiteUrl && (
					<p><small>Examples use results from primary site <strong>{ primarySiteUrl }</strong></small></p>
				) }
				{ map( queries, ( query, label ) => {
					return (
						<p key={ label }>
							<h3>{ label }</h3>
							{ primarySiteId && (
								<QueryPosts
									siteId={ primarySiteId }
									query={ query } />
							) }
							{ ! globalIdByQueryLabel[ label ] && <em>No matching post found</em> }
							<PostStatus globalId={ globalIdByQueryLabel[ label ] } />
						</p>
					);
				} ) }
			</Card>
		</div>
	);
}

const ConnectedPostStatusExample = connect( ( state ) => {
	const user = getCurrentUser( state );
	const primarySiteId = get( user, 'primary_blog' );
	const queries = {
		Scheduled: { status: 'future', number: 1, type: 'any' },
		Trashed: { status: 'trash', number: 1, type: 'any' },
		'Pending Review': { status: 'pending', number: 1, type: 'any' },
		Sticky: { sticky: 'require', number: 1, type: 'any' }
	};

	return {
		queries,
		primarySiteId,
		primarySiteUrl: get( user, 'primary_blog_url' ),
		globalIdByQueryLabel: mapValues( queries, ( query ) => {
			return get( getSitePostsForQuery( state, primarySiteId, query ), [ 0, 'global_ID' ] );
		} )
	};
} )( PostStatusExample );

ConnectedPostStatusExample.displayName = 'PostStatus';

export default ConnectedPostStatusExample;
