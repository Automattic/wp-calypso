/**
 * External dependencies
 */
import React from 'react';
import PropTypes from 'prop-types';
import classnames from 'classnames';
import { connect } from 'react-redux';
import { localize } from 'i18n-calypso';

/**
 * Internal dependencies
 */
import { getEditorPath } from 'state/ui/editor/selectors';
import { getNormalizedPost } from 'state/posts/selectors';
import { getSite, getSiteTitle } from 'state/sites/selectors';
import SiteIcon from 'blocks/site-icon';
import Card from 'components/card';
import PostRelativeTime from 'blocks/post-relative-time';
import PostStatus from 'blocks/post-status';
import PostTypeListPostThumbnail from 'my-sites/post-type-list/post-thumbnail';
import PostActionsEllipsisMenu from 'my-sites/post-type-list/post-actions-ellipsis-menu';
import PostTypePostAuthor from 'my-sites/post-type-list/post-type-post-author';

function PostItem( { translate, globalId, post, site, editUrl, siteTitle, className, compact } ) {
	const title = post ? post.title : null;
	const classes = classnames( 'post-item', className, {
		'is-untitled': ! title,
		'is-mini': compact,
		'is-placeholder': ! globalId
	} );

	return (
		<Card compact className={ classes }>
			<div className="post-item__detail">
				<div className="post-item__title-meta">
					<div>
						<SiteIcon size={ 16 } site={ site } />
						{ siteTitle }
					</div>
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
	site: PropTypes.object,
	siteTitle: PropTypes.string,
	className: PropTypes.string,
	compact: PropTypes.bool
};

export default connect( ( state, ownProps ) => {
	const post = getNormalizedPost( state, ownProps.globalId );
	if ( ! post ) {
		return {};
	}

	const siteId = post.site_ID;

	return {
		post,
		site: getSite( state, siteId ),
		siteTitle: getSiteTitle( state, siteId ),
		editUrl: getEditorPath( state, siteId, post.ID ),
	};
} )( localize( PostItem ) );
