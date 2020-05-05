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
import { Card } from '@automattic/components';
import PostStatus from '../';
import { getCurrentUser } from 'state/current-user/selectors';
import { getPostsForQuery } from 'state/posts/selectors';

function PostStatusExample( { queries, primarySiteId, primarySiteUrl, globalIdByQueryLabel } ) {
	return (
		<Card>
			{ primarySiteUrl && (
				<p>
					<small>
						Examples use results from primary site <strong>{ primarySiteUrl }</strong>
					</small>
				</p>
			) }
			{ map( queries, ( query, label ) => {
				return (
					<p key={ label }>
						<h3>{ label }</h3>
						{ primarySiteId && <QueryPosts siteId={ primarySiteId } query={ query } /> }
						{ ! globalIdByQueryLabel[ label ] && <em>No matching post found</em> }
						<PostStatus globalId={ globalIdByQueryLabel[ label ] } showAll />
					</p>
				);
			} ) }
		</Card>
	);
}

const queries = {
	Scheduled: { status: 'future', number: 1, type: 'any' },
	Trashed: { status: 'trash', number: 1, type: 'any' },
	'Pending Review': { status: 'pending', number: 1, type: 'any' },
	Sticky: { sticky: 'require', number: 1, type: 'any' },
};

const getFirstGlobalIdByQueryLabel = ( state, siteId ) =>
	mapValues( queries, ( query ) => {
		const postsForQuery = getPostsForQuery( state, siteId, query );
		return get( postsForQuery, [ 0, 'global_ID' ] );
	} );

const ConnectedPostStatusExample = connect( ( state ) => {
	const user = getCurrentUser( state );
	const primarySiteId = get( user, 'primary_blog' );
	return {
		queries,
		primarySiteId,
		primarySiteUrl: get( user, 'primary_blog_url' ),
		globalIdByQueryLabel: getFirstGlobalIdByQueryLabel( state, primarySiteId ),
	};
} )( PostStatusExample );

ConnectedPostStatusExample.displayName = 'PostStatus';

export default ConnectedPostStatusExample;
