/**
 * External dependencies
 */
import React, { PropTypes } from 'react';
import classnames from 'classnames';
import { connect } from 'react-redux';

/**
 * Internal dependencies
 */
import { getEditorPath } from 'state/ui/editor/selectors';
import { getPost } from 'state/posts/selectors';
import Card from 'components/card';
import PostRelativeTimeStatus from 'my-sites/post-relative-time-status';
import resizeImageUrl from 'lib/resize-image-url';
import PostTypeListPostActions from './post-actions';

export function PostTypeListPost( { globalId, post, editUrl, className } ) {
	const classes = classnames( 'post-type-list__post', className );

	return (
		<Card compact className={ classes }>
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
			<PostTypeListPostActions globalId={ globalId } />
		</Card>
	);
}

PostTypeListPost.propTypes = {
	globalId: PropTypes.string,
	post: PropTypes.object,
	className: PropTypes.string
};

export default connect( ( state, ownProps ) => {
	const post = getPost( state, ownProps.globalId );

	return {
		post,
		editUrl: getEditorPath( state, state.ui.selectedSiteId, post.ID )
	};
} )( PostTypeListPost );
