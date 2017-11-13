/** @format */

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
import { abtest } from 'lib/abtest';
import { isEnabled } from 'config';
import { getEditorPath } from 'state/ui/editor/selectors';
import { getSelectedSiteId } from 'state/ui/selectors';
import { getNormalizedPost } from 'state/posts/selectors';
import { isSingleUserSite } from 'state/sites/selectors';
import { areAllSitesSingleUser, canCurrentUserEditPost } from 'state/selectors';
import {
	isSharePanelOpen,
	isMultiSelectEnabled,
	isPostSelected,
} from 'state/ui/post-type-list/selectors';
import { hideSharePanel, togglePostSelection } from 'state/ui/post-type-list/actions';
import ExternalLink from 'components/external-link';
import FormInputCheckbox from 'components/forms/form-checkbox';
import PostTime from 'blocks/post-time';
import PostStatus from 'blocks/post-status';
import PostShare from 'blocks/post-share';
import PostTypeListPostThumbnail from 'my-sites/post-type-list/post-thumbnail';
import PostActionsEllipsisMenu from 'my-sites/post-type-list/post-actions-ellipsis-menu';
import PostTypeSiteInfo from 'my-sites/post-type-list/post-type-site-info';
import PostTypePostAuthor from 'my-sites/post-type-list/post-type-post-author';

class PostItem extends React.Component {
	hideCurrentSharePanel = () => {
		this.props.hideSharePanel( this.props.globalId );
	};

	toggleCurrentPostSelection = event => {
		this.props.togglePostSelection( this.props.globalId );
		event.stopPropagation();
	};

	inAllSitesModeWithMultipleUsers() {
		return (
			this.props.isAllSitesModeSelected &&
			! this.props.allSitesSingleUser &&
			! this.props.singleUserQuery
		);
	}

	inSingleSiteModeWithMultipleUsers() {
		return (
			! this.props.isAllSitesModeSelected &&
			! this.props.singleUserSite &&
			! this.props.singleUserQuery
		);
	}

	hasMultipleUsers() {
		return this.inAllSitesModeWithMultipleUsers() || this.inSingleSiteModeWithMultipleUsers();
	}

	renderSelectionCheckbox() {
		const { multiSelectEnabled, isCurrentPostSelected } = this.props;
		return (
			multiSelectEnabled && (
				<div className="post-item__select" onClick={ this.toggleCurrentPostSelection }>
					<FormInputCheckbox
						checked={ isCurrentPostSelected }
						onClick={ this.toggleCurrentPostSelection }
					/>
				</div>
			)
		);
	}

	renderExpandedContent() {
		const { post, isCurrentSharePanelOpen } = this.props;

		if ( ! post || ! isCurrentSharePanelOpen ) {
			return null;
		}

		return (
			<PostShare
				post={ post }
				siteId={ post.site_ID }
				showClose={ true }
				onClose={ this.hideCurrentSharePanel }
			/>
		);
	}

	render() {
		const {
			className,
			post,
			externalPostLink,
			postUrl,
			globalId,
			isAllSitesModeSelected,
			translate,
			largeTitle,
			wrapTitle,
		} = this.props;

		const title = post ? post.title : null;
		const isPlaceholder = ! globalId;

		const panelClasses = classnames( 'post-item__panel', className, {
			'is-untitled': ! title,
			'is-placeholder': isPlaceholder,
			'has-large-title': largeTitle,
			'has-wrapped-title': wrapTitle,
		} );

		const arePostsCondensed =
			isEnabled( 'posts/post-type-list' ) && abtest( 'condensedPostList' ) === 'condensedPosts';

		const isSiteInfoVisible = arePostsCondensed && isAllSitesModeSelected;

		const isAuthorVisible = arePostsCondensed && this.hasMultipleUsers() && post && post.author;

		const expandedContent = this.renderExpandedContent();

		const rootClasses = classnames( 'post-item', {
			'is-expanded': !! expandedContent,
		} );

		return (
			<div className={ rootClasses } ref={ this.setDomNode }>
				<div className={ panelClasses }>
					{ this.renderSelectionCheckbox() }
					<div className="post-item__detail">
						<div className="post-item__info">
							{ isSiteInfoVisible && <PostTypeSiteInfo globalId={ globalId } /> }
							{ isAuthorVisible && <PostTypePostAuthor globalId={ globalId } /> }
						</div>
						<h1 className="post-item__title">
							{ ! externalPostLink && (
								<a href={ isPlaceholder ? null : postUrl } className="post-item__title-link">
									{ title || translate( 'Untitled' ) }
								</a>
							) }
							{ ! isPlaceholder &&
								externalPostLink && (
									<ExternalLink
										icon={ true }
										href={ postUrl }
										target="_blank"
										className="post-item__title-link"
									>
										{ title || translate( 'Untitled' ) }
									</ExternalLink>
								) }
						</h1>
						<div className="post-item__meta">
							<PostTime globalId={ globalId } />
							<PostStatus globalId={ globalId } />
						</div>
					</div>
					<PostTypeListPostThumbnail globalId={ globalId } />
					<PostActionsEllipsisMenu globalId={ globalId } />
				</div>
				{ expandedContent }
			</div>
		);
	}
}

PostItem.propTypes = {
	translate: PropTypes.func,
	globalId: PropTypes.string,
	post: PropTypes.object,
	canEdit: PropTypes.bool,
	postUrl: PropTypes.string,
	isAllSitesModeSelected: PropTypes.bool,
	allSitesSingleUser: PropTypes.bool,
	singleUserSite: PropTypes.bool,
	singleUserQuery: PropTypes.bool,
	className: PropTypes.string,
	compact: PropTypes.bool,
	isCurrentSharePanelOpen: PropTypes.bool,
	hideSharePanel: PropTypes.func,
	largeTitle: PropTypes.bool,
	wrapTitle: PropTypes.bool,
};

export default connect(
	( state, { globalId } ) => {
		const post = getNormalizedPost( state, globalId );
		if ( ! post ) {
			return {};
		}

		const siteId = post.site_ID;

		// Avoid rendering an external link while loading.
		const externalPostLink = false === canCurrentUserEditPost( state, globalId );
		const postUrl = externalPostLink ? post.URL : getEditorPath( state, siteId, post.ID );

		return {
			post,
			externalPostLink,
			postUrl,
			isAllSitesModeSelected: getSelectedSiteId( state ) === null,
			allSitesSingleUser: areAllSitesSingleUser( state ),
			singleUserSite: isSingleUserSite( state, siteId ),
			isCurrentSharePanelOpen: isSharePanelOpen( state, globalId ),
			isCurrentPostSelected: isPostSelected( state, globalId ),
			multiSelectEnabled: isMultiSelectEnabled( state ),
		};
	},
	{
		hideSharePanel,
		togglePostSelection,
	}
)( localize( PostItem ) );
