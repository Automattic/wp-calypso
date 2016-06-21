/**
 * External dependencies
 */
import React from 'react';
import ReactCSSTransitionGroup from 'react-addons-css-transition-group';
import classNames from 'classnames';

/**
 * Internal dependencies
 */
import Card from 'components/card';
import Gridicon from 'components/gridicon';
import PostRelativeTimeStatus from 'my-sites/post-relative-time-status';
import PostControls from './post-controls';
import PostHeader from './post-header';
import PostImage from '../post/post-image';
import PostExcerpt from 'components/post-excerpt';
import PostTotalViews from 'my-sites/posts/post-total-views';
import utils from 'lib/posts/utils';
import updatePostStatus from 'lib/mixins/update-post-status';
import analytics from 'lib/analytics';

import Comments from 'reader/comments';

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

module.exports = React.createClass( {

	displayName: 'Post',

	mixins: [ updatePostStatus ],

	getInitialState() {
		return {
			showMoreOptions: false,
			showComments: false
		};
	},

	shouldComponentUpdate( nextProps, nextState ) {
		const propsToCheck = [ 'ref', 'key', 'post', 'postImages', 'fullWidthPost', 'path' ];

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
		this.strings = {
			trashing: this.translate( 'Trashing Post' ),
			deleting: this.translate( 'Deleting Post' ),
			trashed: this.translate( 'Moved to Trash' ),
			undo: this.translate( 'undo?' ),
			deleted: this.translate( 'Post Deleted' ),
			updating: this.translate( 'Updating Post' ),
			error: this.translate( 'Error' ),
			updated: this.translate( 'Updated' ),
			deleteWarning: this.translate( 'Delete this post permanently?' ),
			restoring: this.translate( 'Restoring' ),
			restored: this.translate( 'Restored' )
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
				<a href={ this.getContentLinkURL() } className="post__title-link post__content-link" target={ this.getContentLinkTarget() } onClick={ this.analyticsEvents.postTitleClick }>
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
		const selectedSite = this.props.sites.getSelectedSite();
		const site = this.getSite();

		if ( selectedSite && site.single_user_site ) {
			return null;
		}

		return <PostHeader site={ site } author={ this.props.post.author ? this.props.post.author.name : '' } path={ this.props.path } showAuthor={ ! site.single_user_site } />;
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

	getMeta() {
		// @todo Let's make these separate components
		const post = this.props.post;
		const postId = this.props.post.ID;
		const site = this.getSite();
		const isJetpack = site.jetpack;
		let showComments = ! isJetpack || site.isModuleActive( 'comments' );
		let showLikes = ! isJetpack || site.isModuleActive( 'likes' );
		const showStats = site.capabilities && site.capabilities.view_stats && ( ! isJetpack || site.isModuleActive( 'stats' ) );
		const metaItems = [];
		let commentCountDisplay, commentTitle, commentMeta,
			likeCountDisplay, likeTitle, likeMeta, footerMetaItems;

		if ( showComments ) {
			if ( post.discussion && post.discussion.comment_count > 0 ) {
				commentTitle = this.translate( '%(count)s Comment', '%(count)s Comments', {
					count: post.discussion.comment_count,
					args: {
						count: post.discussion.comment_count
					}
				} );
				commentCountDisplay = this.numberFormat( post.discussion.comment_count );
			} else if ( post.discussion.comments_open ) {
				commentTitle = this.translate( 'Comments' );
			} else {
				// No comments recorded & they're disabled, don't show the icon
				showComments = false;
			}
			if ( showComments ) {
				commentMeta = (
					<a
						className={
							classNames( {
								post__comments: true,
								'is-empty': ! commentCountDisplay
							} )
						}
						title={ commentTitle }
						onClick={ this.toggleComments }
					>
					<Gridicon icon="comment" size={ 24 } />

					<span>{ commentCountDisplay }</span></a>
				);
				metaItems.push( commentMeta );
			}
		}

		if ( showLikes ) {
			if ( post.like_count > 0 ) {
				likeTitle = this.translate( '%(count)s Like', '%(count)s Likes', {
					count: post.like_count,
					args: {
						count: post.like_count
					}
				} );
				likeCountDisplay = this.numberFormat( post.like_count );
			} else if ( post.likes_enabled ) {
				likeTitle = this.translate( 'Likes' );
			} else {
				// No likes recorded & they're disabled, don't show the icon
				showLikes = false;
			}
			if ( showLikes ) {
				likeMeta = (
					<a
						href={ post.URL }
						className={ classNames( {
							post__likes: true,
							'is-empty': ! likeCountDisplay
						} ) }
						target="_blank"
						title={ likeTitle }
						onClick={ this.analyticsEvents.likeIconClick }
					>
					<Gridicon icon="star" size={ 24 } />
					<span>{ likeCountDisplay }</span></a>
				);
				metaItems.push( likeMeta );
			}
		}

		// If the user can see stats, show how many total views this post has received
		if ( showStats ) {
			metaItems.push( (
				<PostTotalViews post={ post } clickHandler={ this.analyticsEvents.viewStats } />
			) );
		}

		if ( metaItems.length ) {
			footerMetaItems = metaItems.map( function( item, i ) {
				const itemKey = 'meta-' + postId + '-' + i;
				return ( <li key={ itemKey }><span>{ item }</span></li> );
			}, this );

			return ( <ul className="post__meta">{ footerMetaItems }</ul> );
		}
	},

	getContentLinkURL() {
		const post = this.props.post;
		const site = this.getSite();

		if ( utils.userCan( 'edit_post', post ) ) {
			return utils.getEditURL( post, site );
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

	getSite() {
		return this.props.sites.getSite( this.props.post.site_ID );
	},

	toggleComments() {
		this.setState( {
			showComments: ! this.state.showComments
		} );
		this.analyticsEvents.commentIconClick();
	},

	render() {
		const site = this.getSite();

		return (
			<Card tagName="article" className={ this.getPostClass() }>
				<div className="post__body">
					{ this.getHeader() }
					{ this.getPostImage() }
					{ this.getContent() }
					<footer className="post__info">
						<PostRelativeTimeStatus post={ this.props.post } link={ this.getContentLinkURL() } target={ this.getContentLinkTarget() } onClick={ this.analyticsEvents.dateClick }/>
						{
							// Only show meta items for non-drafts
							( this.props.post.status === 'draft' ) ? null : this.getMeta()
						}
					</footer>
				</div>
				<PostControls
					post={ this.props.post }
					editURL={ utils.getEditURL( this.props.post, site ) }
					fullWidth={ this.props.fullWidthPost }
					onShowMore={ this.toggleMoreControls.bind( this, 'show' ) }
					onHideMore={ this.toggleMoreControls.bind( this, 'hide' ) }
					onPublish={ this.publishPost }
					onTrash={ this.trashPost }
					onDelete={ this.deletePost }
					onRestore={ this.restorePost }
					site={ site }
				/>
				<ReactCSSTransitionGroup
					transitionName="updated-trans"
					transitionEnterTimeout={ 300 }
					transitionLeaveTimeout={ 300 }>
					{ this.buildUpdateTemplate() }
				</ReactCSSTransitionGroup>
				{ this.state.showComments && <Comments post={ this.props.post } onCommentsUpdate={ () => {} } /> }
			</Card>
		);
	}

} );
