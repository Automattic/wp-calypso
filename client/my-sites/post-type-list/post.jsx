/**
 * External dependencies
 */
import React, { PropTypes } from 'react';
import { connect } from 'react-redux';

/**
 * Internal dependencies
 */
import { getEditorPath } from 'state/ui/editor/selectors';
import { getPost } from 'state/posts/selectors';
import Card from 'components/card';
import PostRelativeTimeStatus from 'my-sites/post-relative-time-status';
import Button from 'components/button';
import Gridicon from 'components/gridicon';
import resizeImageUrl from 'lib/resize-image-url';

function PostTypePost( { post, editUrl } ) {
	return (
		<Card compact className="post-type-list__post">
			<div className="post-type-list__post-detail">
				{ post.featured_image && (
					<div className="post-type-list__post-thumbnail-wrapper">
						<img
							alt="Post thumbnail"
							src={ resizeImageUrl( post.featured_image, { w: 80 } ) }
							className="post-type-list__post-thumbnail" />
					</div>
				) }
				<div className="post-type-list__post-title-meta">
					<h1 className="post-type-list__post-title">
						<a href={ editUrl }>
							{ post.title }
						</a>
					</h1>
					<div className="post-type-list__post-meta">
						<PostRelativeTimeStatus post={ post } />
					</div>
				</div>
			</div>
			<div className="post-type-list__post-actions">
				<Button href={ post.URL } target="_blank" borderless>
					<Gridicon icon="external" />
				</Button>
			</div>
		</Card>
	);
}

PostTypePost.propTypes = {
	globalId: PropTypes.string.isRequired,
	post: PropTypes.object
};

export default connect( ( state, ownProps ) => {
	const post = getPost( state, ownProps.globalId );

	return {
		post,
		editUrl: getEditorPath( state, state.ui.selectedSiteId, post.ID )
	};
} )( PostTypePost );
