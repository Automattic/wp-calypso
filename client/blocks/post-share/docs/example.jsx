/**
 * External dependencies
 */
import React from 'react';
import { get } from 'lodash';
import { connect } from 'react-redux';

/**
 * Internal dependencies
 */
import PostShare from 'blocks/post-share';
import QueryPosts from 'components/data/query-posts';
import QuerySitePlans from 'components/data/query-site-plans';
import { getSite } from 'state/sites/selectors';
import { getSitePosts } from 'state/posts/selectors';
import { getCurrentUser } from 'state/current-user/selectors';
import Card from 'components/card';
import QuerySites from 'components/data/query-sites';

const PostShareExample = ( { post = {}, site, siteId } ) => (
	<div>
		{ siteId && <QuerySites siteId={ siteId } /> }
		{ siteId && <QuerySitePlans siteId={ siteId } /> }
		{ siteId && (
			<QueryPosts
				siteId={ siteId }
				query={ { number: 1, type: 'post' } } />
		) }

		{ site && <p>Site: <strong>{ site.name } ({ siteId })</strong></p> }

		<Card>
			<PostShare
				post= { post }
				siteId={ siteId } />
		</Card>
	</div>
);

const ConnectedPostShareExample = connect( ( state ) => {
	const user = getCurrentUser( state );
	const siteId = get( user, 'primary_blog' );
	const site = getSite( state, siteId );
	const posts = getSitePosts( state, siteId );
	const post = posts && posts[ posts.length - 1 ];

	return {
		siteId,
		post,
		site,
	};
} )( PostShareExample );

ConnectedPostShareExample.displayName = 'PostShare';

export default ConnectedPostShareExample;
