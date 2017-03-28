/**
 * External dependencies
 */
import React from 'react';
import { get } from 'lodash';
import { connect } from 'react-redux';

/**
 * Internal dependencies
 */
import SharingPreviewPane from 'blocks/sharing-preview-pane';
import { getCurrentUser } from 'state/current-user/selectors';
import QueryPosts from 'components/data/query-posts';
import { getSitePosts } from 'state/posts/selectors';
import Card from 'components/card';
import QuerySites from 'components/data/query-sites';

const SharingPreviewPaneExample = ( { siteId, postId } ) => (
	<Card>
		<QuerySites siteId={ siteId } />
		{ siteId && (
			<QueryPosts
				siteId={ siteId }
				query={ { number: 1, type: 'post' } } />
		) }
		<SharingPreviewPane
			message="Do you have a trip coming up?"
			postId={ postId }
			siteId={ siteId } />
	</Card>
);

const ConnectedSharingPreviewPaneExample = connect( ( state ) => {
	const user = getCurrentUser( state );
	const siteId = get( user, 'primary_blog' );
	const posts = getSitePosts( state, siteId );
	const post = posts && posts[ posts.length - 1 ];
	const postId = get( post, 'ID' );

	return {
		siteId,
		postId,
	};
} )( SharingPreviewPaneExample );

ConnectedSharingPreviewPaneExample.displayName = 'SharingPreviewPane';

export default ConnectedSharingPreviewPaneExample;
