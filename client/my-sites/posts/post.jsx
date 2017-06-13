/**
 * External dependencies
 */
import React from 'react';
import ReactCSSTransitionGroup from 'react-addons-css-transition-group';
import classNames from 'classnames';
import { connect } from 'react-redux';
import { localize } from 'i18n-calypso';

/**
 * Internal dependencies
 */
import { isEnabled } from 'config';
import Card from 'components/card';
import PostControls from './post-controls';
import PostHeader from './post-header';
import PostImage from '../post/post-image';
import PostExcerpt from 'components/post-excerpt';
import utils from 'lib/posts/utils';
import updatePostStatus from 'lib/mixins/update-post-status';
import analytics from 'lib/analytics';
import config from 'config';
import { setPreviewUrl } from 'state/ui/preview/actions';
import { setLayoutFocus } from 'state/ui/layout-focus/actions';
import { getPostPreviewUrl } from 'state/posts/selectors';
import { isSingleUserSite, isSitePreviewable } from 'state/sites/selectors';
import { getSelectedSiteId } from 'state/ui/selectors';
import { getEditorPath } from 'state/ui/editor/selectors';

import Comments from 'blocks/comments';
import PostShare from 'blocks/post-share';

import PostActions from 'blocks/post-actions';

function recordEvent( eventAction ) {
	analytics.ga.recordEvent( 'Posts', eventAction );
}

function checkPropsChange( currentProps, nextProps, propArr ) {
	for ( let i = 0; i < propArr.length; i++ ) {
		const prop = propArr[ i ];
		if ( nextProps[ prop ] !== currentProps[ prop ] ) {
			return true;
		}
	}
	return false;
}

const Post = React.createClass( {

	displayName: 'Post',

	mixins: [ updatePostStatus ],

	getInitialState() {
		return {
			showMoreOptions: false,
			showComments: false,
			showShare: false,
			commentsFilter: 'all'
		};
	},

	shouldComponentUpdate( nextProps, nextState ) {
		const propsToCheck = [ 'post', 'postImages', 'fullWidthPost', 'path' ];

		if ( checkPropsChange( this.props, nextProps, propsToCheck ) ) {
			return true;
		}

		if ( nextState.showMoreOptions !== this.props.showMoreOptions ) {
			return true;
		}

		return false;
	},

	analyticsEvents: {
		viewPost() {
			recordEvent( 'Clicked View Post' );
		},
		previewPost() {
			recordEvent( 'Clicked Preview Post' );
		},
		editPost() {
			recordEvent( 'Clicked Edit Post' );
		},
		commentIconClick() {
			recordEvent( 'Clicked Post Comment Icon/Number' );
		},
		likeIconClick() {
			recordEvent( 'Clicked Post Likes Icon/Number' );
		},
		dateClick() {
			recordEvent( 'Clicked Post Date' );
		},
		featuredImageStandardClick() {
			recordEvent( 'Clicked Post Featured Image Standard' );
		},
		featuredImageLargeClick() {
			recordEvent( 'Clicked Post Featured Image Large' );
		},
		postTitleClick() {
			recordEvent( 'Clicked Post Title' );
		},
		postExcerptClick() {
			recordEvent( 'Clicked Post Excerpt' );
		},
		viewStats() {
			recordEvent( 'Clicked View Post Stats' );
		}

	},

	publishPost() {
		this.updatePostStatus( 'publish' );
		recordEvent( 'Clicked Publish Post' );
	},

	restorePost() {
		this.updatePostStatus( 'restore' );
		recordEvent( 'Clicked Restore Post' );
	},

	deletePost() {
		this.updatePostStatus( 'delete' );
		recordEvent( 'Clicked Delete Post' );
	},

	trashPost() {
		this.updatePostStatus( 'trash' );
		recordEvent( 'Clicked Trash Post' );
	},

	componentWillMount() {
		const { translate } = this.props;

		this.strings = {
			trashing: translate( 'Trashing Post' ),
			deleting: translate( 'Deleting Post' ),
			trashed: translate( 'Moved to Trash' ),
			undo: translate( 'undo?' ),
			deleted: translate( 'Post Deleted' ),
			updating: translate( 'Updating Post' ),
			error: translate( 'Error' ),
			updated: translate( 'Updated' ),
			deleteWarning: translate( 'Delete this post permanently?' ),
			restoring: translate( 'Restoring' ),
			restored: translate( 'Restored' )
		};
	},

	canUserEditPost() {
		const post = this.props.post;
		return post.capabilities && post.capabilities.edit_post && post.status !== 'trash';
	},

	getPostClass() {
		return classNames( {
			post: true,
			'is-protected': ( this.props.post.password ) ? true : false,
			'show-more-options': this.state.showMoreOptions
		} );
	},

	getTitle() {
		if ( this.props.post.title ) {
			return (
				<a
					href={ this.getContentLinkURL() }
					className="post__title-link post__content-link"
					target={ this.getContentLinkTarget() }
					onClick={ this.analyticsEvents.postTitleClick }>
					<h4 className="post__title">{ this.props.post.title }</h4>
				</a>
			);
		}
	},

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
	},

	getTrimmedExcerpt() {
		const excerpt = this.props.post.excerpt;
		return ( excerpt.length <= 220 ) ? excerpt : excerpt.substring( 0, 220 ) + '\u2026';
	},

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
			<a href={ this.getContentLinkURL() } className="post__excerpt post__content-link" target={ this.getContentLinkTarget() } onClick={ this.analyticsEvents.postExcerptClick }>
				{ excerptElement }
			</a>
		);
	},

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
	},

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
	},

	getContentLinkURL() {
		const post = this.props.post;

		if ( utils.userCan( 'edit_post', post ) ) {
			return this.props.editUrl;
		} else if ( post.status === 'trash' ) {
			return null;
		}
		return post.URL;
	},

	getContentLinkTarget() {
		if ( utils.userCan( 'edit_post', this.props.post ) ) {
			return null;
		}

		return '_blank';
	},

	toggleMoreControls( visibility ) {
		this.setState( {
			showMoreOptions: ( visibility === 'show' )
		} );
	},

	toggleComments() {
		this.setState( {
			showComments: ! this.state.showComments
		} );
		this.analyticsEvents.commentIconClick();
	},

	toggleShare() {
		this.setState( { showShare: ! this.state.showShare } );
	},

	viewPost( event ) {
		event.preventDefault();
		const { isPreviewable, previewUrl, selectedSiteId } = this.props;

		if ( this.props.post.status && this.props.post.status === 'future' ) {
			this.analyticsEvents.previewPost;
		} else {
			this.analyticsEvents.viewPost;
		}

		if ( ! isPreviewable || ! selectedSiteId ) {
			return window.open( previewUrl );
		}

		this.props.setPreviewUrl( previewUrl );
		this.props.setLayoutFocus( 'preview' );
	},

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
					onShowMore={ this.toggleMoreControls.bind( this, 'show' ) }
					onHideMore={ this.toggleMoreControls.bind( this, 'hide' ) }
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
					{ this.buildUpdateTemplate() }
				</ReactCSSTransitionGroup>
				{ this.state.showComments &&
					<Comments
						showCommentCount={ false }
						post={ this.props.post }
						showFilters={ isEnabled( 'comments/filters-in-posts' ) }
						showModerationTools={ isEnabled( 'comments/moderation-tools-in-posts' ) }
						commentsFilter={ config.isEnabled( 'comments/filters-in-posts' ) ? this.state.commentsFilter : 'approved' }
						onFilterChange={ commentsFilter => this.setState( { commentsFilter } ) }
						onCommentsUpdate={ () => {} } />
				}
				{ this.state.showShare && config.isEnabled( 'republicize' ) &&
					<PostShare post={ this.props.post } siteId={ this.props.post.site_ID } />
				}
			</Card>
		);
	}

} );

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
	{ setPreviewUrl, setLayoutFocus }
)( localize( Post ) );
