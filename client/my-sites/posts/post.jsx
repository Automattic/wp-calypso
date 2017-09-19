/**
 * External dependencies
 */
import PropTypes from 'prop-types';

import React, { Component } from 'react';
import ReactCSSTransitionGroup from 'react-addons-css-transition-group';
import shallowEqual from 'react-pure-render/shallowEqual';
import classNames from 'classnames';
import { connect } from 'react-redux';
import { localize } from 'i18n-calypso';
import { partial, noop } from 'lodash';

/**
 * Internal dependencies
 */
import { isEnabled } from 'config';
import Card from 'components/card';
import PostControls from './post-controls';
import PostFormat from 'components/post-format';
import PostHeader from './post-header';
import PostImage from '../post/post-image';
import PostExcerpt from 'components/post-excerpt';
import updatePostStatus from 'components/update-post-status';
import utils from 'lib/posts/utils';
import config from 'config';
import { recordGoogleEvent } from 'state/analytics/actions';
import { setPreviewUrl } from 'state/ui/preview/actions';
import { setLayoutFocus } from 'state/ui/layout-focus/actions';
import { getPostPreviewUrl } from 'state/posts/selectors';
import { isSingleUserSite, isSitePreviewable } from 'state/sites/selectors';
import { getSelectedSiteId } from 'state/ui/selectors';
import { getEditorPath } from 'state/ui/editor/selectors';

import Comments from 'blocks/comments';
import PostShare from 'blocks/post-share';
import PostActions from 'blocks/post-actions';

const recordEvent = partial( recordGoogleEvent, 'Posts' );

function checkPropsChange( currentProps, nextProps, propArr ) {
	for ( let i = 0; i < propArr.length; i++ ) {
		const prop = propArr[ i ];
		if ( nextProps[ prop ] !== currentProps[ prop ] ) {
			return true;
		}
	}
	return false;
}

class Post extends Component {
	static propTypes = {
		// connected via Redux
		setPreviewUrl: PropTypes.func.isRequired,
		setLayoutFocus: PropTypes.func.isRequired,
		recordViewPost: PropTypes.func.isRequired,
		recordPreviewPost: PropTypes.func.isRequired,
		recordCommentIconClick: PropTypes.func.isRequired,
		recordPostTitleClick: PropTypes.func.isRequired,
		recordPostExcerptClick: PropTypes.func.isRequired,
		recordPublishPost: PropTypes.func.isRequired,
		recordRestorePost: PropTypes.func.isRequired,
		recordDeletePost: PropTypes.func.isRequired,
		recordTrashPost: PropTypes.func.isRequired,

		// connected via updatePostStatus
		buildUpdateTemplate: PropTypes.func.isRequired,
		togglePageActions: PropTypes.func.isRequired,
		updatePostStatus: PropTypes.func.isRequired,
		updated: PropTypes.bool.isRequired,
		updatedStatus: PropTypes.string,
		previousStatus: PropTypes.string,
		showMoreOptions: PropTypes.bool.isRequired,
		showPageActions: PropTypes.bool.isRequired,
	}

	state = {
		showComments: false,
		showShare: false,
		commentsFilter: 'all',
	}

	shouldComponentUpdate( nextProps, nextState ) {
		if ( ! shallowEqual( this.state, nextState ) ) {
			return true;
		}

		const propsToCheck = [
			'post',
			'postImages',
			'fullWidthPost',
			'path',

			// via updatePostStatus
			'previousStatus',
			'showMoreOptions',
			'updated',
			'updatedStatus',
		];
		return checkPropsChange( this.props, nextProps, propsToCheck );
	}

	publishPost = () => {
		this.props.updatePostStatus( 'publish' );
		this.props.recordPublishPost();
	}

	restorePost = () => {
		this.props.updatePostStatus( 'restore' );
		this.props.recordRestorePost();
	}

	deletePost = () => {
		this.props.updatePostStatus( 'delete' );
		this.props.recordDeletePost();
	}

	trashPost = () => {
		this.props.updatePostStatus( 'trash' );
		this.props.recordTrashPost();
	}

	getPostClass() {
		return classNames( 'post', {
			'is-protected': !! this.props.post.password,
			'show-more-options': this.props.showMoreOptions,
		} );
	}

	getTitle() {
		if ( this.props.post.title ) {
			return (
				<a
					href={ this.getContentLinkURL() }
					className="post__title-link post__content-link"
					target={ this.getContentLinkTarget() }
					onClick={ this.props.recordPostTitleClick }>
					<PostFormat format={ this.props.post.format } />
					<h4 className="post__title">
						{ this.props.post.title }
					</h4>
				</a>
			);
		}
	}

	getPostImage() {
		if ( ! this.props.postImages ) {
			if ( this.props.post.canonical_image ) {
				return (
					<div className="post-image is-placeholder" />
				);
			}

			return null;
		}

		return (
			<PostImage postImages={ this.props.postImages } />
		);
	}

	getTrimmedExcerpt() {
		const excerpt = this.props.post.excerpt;
		return ( excerpt.length <= 220 ) ? excerpt : excerpt.substring( 0, 220 ) + '\u2026';
	}

	getExcerpt() {
		let excerptElement;

		if ( ! this.props.post.excerpt ) {
			return null;
		}

		if ( this.props.post.format === 'quote' ) {
			excerptElement = <PostExcerpt content={ this.getTrimmedExcerpt() } className="post__quote" />;
		} else {
			excerptElement = <PostExcerpt content={ this.getTrimmedExcerpt() } />;
		}

		return (
			<a
				href={ this.getContentLinkURL() }
				className="post__excerpt post__content-link"
				target={ this.getContentLinkTarget() }
				onClick={ this.props.recordPostExcerptClick }
			>
				{ excerptElement }
			</a>
		);
	}

	getHeader() {
		if ( this.props.selectedSiteId && this.props.isPostFromSingleUserSite ) {
			return null;
		}

		return (
			<PostHeader siteId={ this.props.post.site_ID }
				author={ this.props.post.author ? this.props.post.author.name : '' }
				path={ this.props.path }
				showAuthor={ ! this.props.isPostFromSingleUserSite } />
		);
	}

	getContent() {
		const post = this.props.post;

		if ( post.title || post.excerpt ) {
			return (
				<div className="post__content">
					{ this.getTitle() }
					{ this.getExcerpt() }
				</div>
			);
		}
	}

	getContentLinkURL() {
		const post = this.props.post;

		if ( utils.userCan( 'edit_post', post ) ) {
			return this.props.editUrl;
		} else if ( post.status === 'trash' ) {
			return null;
		}
		return post.URL;
	}

	getContentLinkTarget() {
		if ( utils.userCan( 'edit_post', this.props.post ) ) {
			return null;
		}

		return '_blank';
	}

	toggleComments = () => {
		this.setState( {
			showComments: ! this.state.showComments
		} );
		this.props.recordCommentIconClick();
	}

	toggleShare = () => {
		this.setState( { showShare: ! this.state.showShare } );
	}

	setCommentsFilter = ( commentsFilter ) => {
		this.setState( { commentsFilter } );
	}

	viewPost = ( event ) => {
		event.preventDefault();
		const { isPreviewable, previewUrl, selectedSiteId } = this.props;

		if ( this.props.post.status && this.props.post.status === 'future' ) {
			this.props.recordPreviewPost();
		} else {
			this.props.recordViewPost();
		}

		if (
				( ! isPreviewable || ! selectedSiteId ) &&
				typeof window === 'object'
		) {
			return window.open( previewUrl );
		}

		this.props.setPreviewUrl( previewUrl );
		this.props.setLayoutFocus( 'preview' );
	}

	render() {
		return (
			<Card tagName="article" className={ this.getPostClass() }>
				<div className="post__body">
					{ this.getHeader() }
					{ this.getPostImage() }
					{ this.getContent() }
					<PostActions siteId={ this.props.post.site_ID }
						post={ this.props.post }
						toggleComments={ this.toggleComments } />
				</div>
				<PostControls
					post={ this.props.post }
					editURL={ this.props.editUrl }
					fullWidth={ this.props.fullWidthPost }
					onShowMore={ this.props.showMoreControls }
					onHideMore={ this.props.hideMoreControls }
					onPublish={ this.publishPost }
					onTrash={ this.trashPost }
					onDelete={ this.deletePost }
					onRestore={ this.restorePost }
					onToggleShare={ this.toggleShare }
					onViewPost={ this.viewPost }
					siteId={ this.props.post.site_ID }
					current={ this.state.showShare ? 'share' : null }
				/>
				<ReactCSSTransitionGroup
					transitionName="updated-trans"
					transitionEnterTimeout={ 300 }
					transitionLeaveTimeout={ 300 }>
					{ this.props.buildUpdateTemplate() }
				</ReactCSSTransitionGroup>
				{ this.state.showComments &&
					<Comments
						showCommentCount={ false }
						commentCount = { this.props.post.discussion.comment_count }
						post={ this.props.post }
						showFilters={ isEnabled( 'comments/filters-in-posts' ) }
						showModerationTools={ isEnabled( 'comments/moderation-tools-in-posts' ) }
						commentsFilter={ config.isEnabled( 'comments/filters-in-posts' ) ? this.state.commentsFilter : 'approved' }
						onFilterChange={ this.setCommentsFilter }
						onCommentsUpdate={ noop }
					/>
				}
				{
					this.state.showShare &&
					config.isEnabled( 'republicize' ) &&
					<PostShare
						post={ this.props.post }
						siteId={ this.props.post.site_ID }
					/>
				}
			</Card>
		);
	}

}

const analyticsEvents = [
	[ 'recordViewPost', 'Clicked View Post' ],
	[ 'recordPreviewPost', 'Clicked Preview Post' ],
	[ 'recordCommentIconClick', 'Clicked Post Comment Icon/Number' ],
	[ 'recordPostTitleClick', 'Clicked Post Title' ],
	[ 'recordPostExcerptClick', 'Clicked Post Excerpt' ],
	[ 'recordPublishPost', 'Clicked Publish Post' ],
	[ 'recordRestorePost', 'Clicked Restore Post' ],
	[ 'recordDeletePost', 'Clicked Delete Post' ],
	[ 'recordTrashPost', 'Clicked Trash Post' ],
];

const mapDispatch = {
	setPreviewUrl,
	setLayoutFocus,
	...analyticsEvents.reduce( ( actions, [ key, event ] ) => {
		actions[ key ] = partial( recordEvent, event );
		return actions;
	}, {} ),
};

export default connect(
	( state, { post } ) => {
		const selectedSiteId = getSelectedSiteId( state );
		return {
			editUrl: getEditorPath( state, post.site_ID, post.ID, 'post' ),
			isPostFromSingleUserSite: isSingleUserSite( state, post.site_ID ),
			isPreviewable: false !== isSitePreviewable( state, post.site_ID ),
			selectedSiteId,

			/*
			 * getPostPreviewUrl() relies on the post to be in Redux.
			 *
			 * There is an out of sync issue, because the posts list is fetched
			 * through Flux and the Redux store is not filled with the proper
			 * Posts data.
			 *
			 * This is a hack to work around that issue for the moment. It must
			 * be removed when the posts list is updated to fetch the posts
			 * through the newer QueryPosts component.
			 *
			 * FIXME(biskobe,mcsf): undo hack
			 * //previewUrl: getPostPreviewUrl( state, post.site_ID, post.ID ),
			 */
			previewUrl: getPostPreviewUrl( state, post.site_ID, post.ID,
				{ __forceUseRawPost: post }
			)
		};
	},
	mapDispatch
)( updatePostStatus( localize( Post ) ) );
