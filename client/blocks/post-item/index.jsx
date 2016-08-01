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
import PostTypeListPostThumbnail from 'my-sites/post-type-list/post-thumbnail';
import PostActionsEllipsisMenu from 'my-sites/post-type-list/post-actions-ellipsis-menu';
import PostTypePostAuthor from 'my-sites/post-type-list/post-type-post-author';

export function PostItem( { translate, globalId, post, editUrl, className } ) {
	const classes = classnames( 'post-item', className, {
		'is-untitled': ! post.title
	} );

	return (
		<Card compact className={ classes }>
			<div className="post-item__detail">
				<div className="post-item__title-meta">
					<h1 className="post-item__title">
						<a href={ editUrl }>
							{ post.title || translate( 'Untitled' ) }
						</a>
					</h1>
					<div className="post-item__meta">
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

PostItem.propTypes = {
	translate: PropTypes.func,
	globalId: PropTypes.string,
	post: PropTypes.object,
	className: PropTypes.string
};

export default connect( ( state, ownProps ) => {
	const post = getNormalizedPost( state, ownProps.globalId );

	return {
		post,
		editUrl: getEditorPath( state, post.site_ID, post.ID )
	};
} )( localize( PostItem ) );
