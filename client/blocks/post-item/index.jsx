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
import PostRelativeTime from 'blocks/post-relative-time';
import PostStatus from 'blocks/post-status';
import PostTypeListPostThumbnail from 'my-sites/post-type-list/post-thumbnail';
import PostActionsEllipsisMenu from 'my-sites/post-type-list/post-actions-ellipsis-menu';
import PostTypePostAuthor from 'my-sites/post-type-list/post-type-post-author';

function PostItem( { translate, globalId, post, editUrl, className } ) {
	const title = post ? post.title : null;
	const classes = classnames( 'post-item', className, {
		'is-untitled': ! title,
		'is-placeholder': ! globalId
	} );

	return (
		<Card compact className={ classes }>
			<div className="post-item__detail">
				<div className="post-item__title-meta">
					<h1 className="post-item__title">
						<a href={ editUrl } className="post-item__title-link">
							{ title || translate( 'Untitled' ) }
						</a>
					</h1>
					<div className="post-item__meta">
						<PostRelativeTime globalId={ globalId } />
						<PostStatus globalId={ globalId } />
						<PostTypePostAuthor globalId={ globalId } />
					</div>
				</div>
			</div>
			<PostTypeListPostThumbnail globalId={ globalId } />
			<PostActionsEllipsisMenu globalId={ globalId } />
		</Card>
	);
}

PostItem.propTypes = {
	translate: PropTypes.func,
	globalId: PropTypes.string,
	post: PropTypes.object,
	className: PropTypes.string
};

export default connect( ( state, ownProps ) => {
	const post = getNormalizedPost( state, ownProps.globalId );
	if ( ! post ) {
		return {};
	}

	return {
		post,
		editUrl: getEditorPath( state, post.site_ID, post.ID )
	};
} )( localize( PostItem ) );
