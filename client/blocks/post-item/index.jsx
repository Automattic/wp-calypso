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
import { isEnabled } from 'config';
import { getEditorPath } from 'state/ui/editor/selectors';
import { getSelectedSiteId } from 'state/ui/selectors';
import { getNormalizedPost } from 'state/posts/selectors';
import { isSingleUserSite } from 'state/sites/selectors';
import { areAllSitesSingleUser } from 'state/selectors';
import Card from 'components/card';
import PostRelativeTime from 'blocks/post-relative-time';
import PostStatus from 'blocks/post-status';
import PostTypeListPostThumbnail from 'my-sites/post-type-list/post-thumbnail';
import PostActionsEllipsisMenu from 'my-sites/post-type-list/post-actions-ellipsis-menu';
import PostTypeSiteInfo from 'my-sites/post-type-list/post-type-site-info';
import PostTypePostAuthor from 'my-sites/post-type-list/post-type-post-author';

class PostItem extends React.Component {

	inAllSitesModeWithMultipleUsers() {
		return this.props.isAllSitesModeSelected && ! this.props.allSitesSingleUser;
	}

	inSingleSiteModeWithMultipleUsers() {
		return ! this.props.isAllSitesModeSelected && ! this.props.singleUserSite;
	}

	render() {
		const { translate, globalId, post, editUrl, className, compact, isAllSitesModeSelected } = this.props;

		const title = post ? post.title : null;
		const postItemClasses = classnames( 'post-item', className, {
			'is-untitled': ! title,
			'is-mini': compact,
			'is-placeholder': ! globalId
		} );

		const isSiteVisible = isEnabled( 'posts/post-type-list' ) && isAllSitesModeSelected;
		const isAuthorVisible = ( this.inAllSitesModeWithMultipleUsers() || this.inSingleSiteModeWithMultipleUsers() ) &&
			post && post.author && isEnabled( 'posts/post-type-list' );

		const titleMetaClasses = classnames( 'post-item__title-meta', { 'site-is-visible': isSiteVisible || isAuthorVisible } );

		return (
			<Card compact className={ postItemClasses }>
				<div className="post-item__detail">
					<div className={ titleMetaClasses }>
						<div className="post-item__info">
							<PostTypeSiteInfo globalId={ globalId } />
							<PostTypePostAuthor globalId={ globalId } />
						</div>
						<h1 className="post-item__title">
							<a href={ editUrl } className="post-item__title-link">
								{ title || translate( 'Untitled' ) }
							</a>
						</h1>
						<div className="post-item__meta">
							<PostRelativeTime globalId={ globalId } />
							<PostStatus globalId={ globalId } />
						</div>
					</div>
				</div>
				<PostTypeListPostThumbnail globalId={ globalId } />
				<PostActionsEllipsisMenu globalId={ globalId } />
			</Card>
		);
	}
}

PostItem.propTypes = {
	translate: PropTypes.func,
	globalId: PropTypes.string,
	editUrl: PropTypes.string,
	post: PropTypes.object,
	isAllSitesModeSelected: PropTypes.bool,
	allSitesSingleUser: PropTypes.bool,
	singleUserSite: PropTypes.bool,
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
		isAllSitesModeSelected: getSelectedSiteId( state ) === null,
		allSitesSingleUser: areAllSitesSingleUser( state ),
		singleUserSite: isSingleUserSite( state, siteId ),
		editUrl: getEditorPath( state, siteId, post.ID ),
	};
} )( localize( PostItem ) );
