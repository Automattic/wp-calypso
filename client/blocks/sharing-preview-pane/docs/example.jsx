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
import QueryPublicizeConnections from 'components/data/query-publicize-connections';
import { getSitePosts } from 'state/posts/selectors';
import { getSite } from 'state/sites/selectors';
import { Card } from '@automattic/components';
import QuerySites from 'components/data/query-sites';

const SharingPreviewPaneExample = ( { postId, site, siteId } ) => (
	<div>
		{ site && (
			<p>
				Site:{ ' ' }
				<strong>
					{ site.name } ({ siteId })
				</strong>
			</p>
		) }
		<Card>
			<QuerySites siteId={ siteId } />
			<QueryPublicizeConnections siteId={ siteId } />
			{ siteId && <QueryPosts siteId={ siteId } query={ { number: 1, type: 'post' } } /> }
			<SharingPreviewPane
				message="Do you have a trip coming up?"
				postId={ postId }
				siteId={ siteId }
			/>
		</Card>
	</div>
);

const ConnectedSharingPreviewPaneExample = connect( ( state ) => {
	const user = getCurrentUser( state );
	const siteId = get( user, 'primary_blog' );
	const site = getSite( state, siteId );
	const posts = getSitePosts( state, siteId );
	const post = posts && posts[ posts.length - 1 ];
	const postId = get( post, 'ID' );

	return {
		siteId,
		postId,
		site,
	};
} )( SharingPreviewPaneExample );

ConnectedSharingPreviewPaneExample.displayName = 'SharingPreviewPane';

export default ConnectedSharingPreviewPaneExample;
