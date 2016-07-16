/**
 * External dependencies
 */
import React, { PropTypes } from 'react';
import classnames from 'classnames';
import { connect } from 'react-redux';
import { localize } from 'i18n-calypso';

/**
 * Internal dependencies
 */
import { getEditorPath } from 'state/ui/editor/selectors';
import { getNormalizedPost } from 'state/posts/selectors';
import Card from 'components/card';
import PostRelativeTimeStatus from 'my-sites/post-relative-time-status';
import PostTypeListPostThumbnail from './post-thumbnail';
import PostActionsEllipsisMenu from './post-actions-ellipsis-menu';
import PostTypePostAuthor from './post-type-post-author';

export function PostTypeListPost( { translate, globalId, post, editUrl, className } ) {
	const classes = classnames( 'post-type-list__post', className, {
		'is-untitled': ! post.title
	} );

	return (
		<Card compact className={ classes }>
			<div className="post-type-list__post-detail">
				<div className="post-type-list__post-title-meta">
					<h1 className="post-type-list__post-title">
						<a href={ editUrl }>
							{ post.title || translate( 'Untitled' ) }
						</a>
					</h1>
					<div className="post-type-list__post-meta">
						<PostRelativeTimeStatus post={ post } />
						<PostTypePostAuthor globalId={ globalId } />
					</div>
				</div>
			</div>
			<PostTypeListPostThumbnail globalId={ globalId } />
			<PostActionsEllipsisMenu globalId={ globalId } />
		</Card>
	);
}

PostTypeListPost.propTypes = {
	translate: PropTypes.func,
	globalId: PropTypes.string,
	post: PropTypes.object,
	className: PropTypes.string
};

export default connect( ( state, ownProps ) => {
	const post = getNormalizedPost( state, ownProps.globalId );

	return {
		post,
		editUrl: getEditorPath( state, state.ui.selectedSiteId, post.ID )
	};
} )( localize( PostTypeListPost ) );
