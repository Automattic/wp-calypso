/**
 * External dependencies
 */
var React = require( 'react' ),
	ReactCSSTransitionGroup = require( 'react-addons-css-transition-group' ),
	classNames = require( 'classnames' );

/**
 * Internal dependencies
 */
var config = require( 'config' ),
	Card = require( 'components/card' ),
	Gridicon = require( 'components/gridicon' ),
	PostRelativeTimeStatus = require( 'my-sites/post-relative-time-status' ),
	PostControls = require( './post-controls' ),
	PostHeader = require( './post-header' ),
	PostImage = require( '../post/post-image' ),
	PostExcerpt = require( 'components/post-excerpt' ),
	PostTotalViews = require( 'my-sites/posts/post-total-views' ),
	utils = require( 'lib/posts/utils' ),
	updatePostStatus = require( 'lib/mixins/update-post-status' ),
	analytics = require( 'analytics' );

function recordEvent( eventAction ) {
	analytics.ga.recordEvent( 'Posts', eventAction );
}

function checkPropsChange( nextProps, propArr ) {
	var i, prop;

	for( i = 0; i < propArr.length; i++ ) {
		prop = propArr[ i ];
		if ( nextProps[ prop ] !== this.props[ prop ] ) {
			return true;
		}
	}
	return false;
}

module.exports = React.createClass({

	displayName: 'Post',

	mixins: [ updatePostStatus ],

	getInitialState: function() {
		return {
			showMoreOptions: false
		};
	},

	shouldComponentUpdate: function( nextProps, nextState ) {

		var propsToCheck = [ 'ref', 'key', 'post', 'postImages', 'fullWidthPost', 'path' ];

		if ( checkPropsChange.call( this, nextProps, propsToCheck ) ) {
			return true;
		}
		if ( nextState.showMoreOptions !== this.props.showMoreOptions ) {
			return true;
		}

		return false;

	},

	analyticsEvents: {
		viewPost: function() {
			recordEvent( 'Clicked View Post' );
		},
		previewPost: function() {
			recordEvent( 'Clicked Preview Post' );
		},
		editPost: function() {
			recordEvent( 'Clicked Edit Post' );
		},
		commentIconClick: function() {
			recordEvent( 'Clicked Post Comment Icon/Number' );
		},
		likeIconClick: function() {
			recordEvent( 'Clicked Post Likes Icon/Number' );
		},
		dateClick: function() {
			recordEvent( 'Clicked Post Date' );
		},
		featuredImageStandardClick: function() {
			recordEvent( 'Clicked Post Featured Image Standard' );
		},
		featuredImageLargeClick: function() {
			recordEvent( 'Clicked Post Featured Image Large' );
		},
		postTitleClick: function() {
			recordEvent( 'Clicked Post Title' );
		},
		postExcerptClick: function() {
			recordEvent( 'Clicked Post Excerpt' );
		},
		viewStats: function() {
			recordEvent( 'Clicked View Post Stats' );
		}

	},

	publishPost: function() {
		this.updatePostStatus( 'publish' );
		recordEvent( 'Clicked Publish Post' );
	},

	restorePost: function() {
		this.updatePostStatus( 'restore' );
		recordEvent( 'Clicked Restore Post' );
	},

	deletePost: function() {
		this.updatePostStatus( 'delete' );
		recordEvent( 'Clicked Delete Post' );
	},

	trashPost: function() {
		this.updatePostStatus( 'trash' );
		recordEvent( 'Clicked Trash Post' );
	},

	componentWillMount: function() {
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

	canUserEditPost: function() {
		var post = this.props.post;
		return post.capabilities && post.capabilities.edit_post && post.status !== 'trash';
	},

	getPostClass: function() {
		var postClasses = classNames( {
			'post': true,
			'is-protected': ( this.props.post.password ) ? true : false,
			'show-more-options': this.state.showMoreOptions
		} );

		return postClasses;
	},

	getTitle: function() {
		if ( this.props.post.title ) {
			return (
				<a href={ this.getContentLinkURL() } className="post__title-link post__content-link" target={ this.getContentLinkTarget() } onClick={ this.analyticsEvents.postTitleClick }>
					<h4 className="post__title">{ this.props.post.title }</h4>
				</a>
			);
		}
	},

	getPostImage: function() {
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

	getTrimmedExcerpt: function() {
		var excerpt = this.props.post.excerpt,
			trimmedExcerpt = ( excerpt.length <= 220 ) ? excerpt : excerpt.substring( 0, 220 ) + '\u2026';

		return ( trimmedExcerpt );
	},

	getExcerpt: function() {
		var excerptElement;

		if ( ! this.props.post.excerpt ) {
			return null;
		}

		if ( this.props.post.format === 'quote' ) {
			excerptElement = <PostExcerpt text={ this.getTrimmedExcerpt() } className="post__quote" />;
		} else {
			excerptElement = <PostExcerpt text={ this.getTrimmedExcerpt() } />;
		}

		return (
			<a href={ this.getContentLinkURL() } className="post__excerpt post__content-link" target={ this.getContentLinkTarget() } onClick={ this.analyticsEvents.postExcerptClick }>
				{ excerptElement }
			</a>
		);
	},

	getHeader: function() {
		var selectedSite = this.props.sites.getSelectedSite(),
			site = this.getSite();

		if ( selectedSite && site.single_user_site ) {
			return null;
		}

		return <PostHeader site={ site } author={ this.props.post.author.name } path={ this.props.path } showAuthor={ ! site.single_user_site } />;
	},

	getContent: function() {
		var post = this.props.post;

		if ( post.title || post.excerpt ) {
			return (
				<div className="post__content">
					{ this.getTitle() }
					{ this.getExcerpt() }
				</div>
			);
		}
	},

	getMeta: function() {
		// @todo Let's make these separate components
		var post = this.props.post,
			postId = this.props.post.ID,
			site = this.getSite(),
			isJetpack = site.jetpack,
			showComments = ! isJetpack || site.isModuleActive( 'comments' ),
			showLikes = ! isJetpack || site.isModuleActive( 'likes' ),
			showStats = site.capabilities && site.capabilities.view_stats && ( ! isJetpack || site.isModuleActive( 'stats' ) ),
			metaItems = [],
			commentCountDisplay, commentHref, commentTitle, commentMeta,
			likeCountDisplay, likeTitle, likeMeta, footerMetaItems;

		if ( showComments ) {
			commentHref = post.URL + '#comments';
			if ( post.discussion && post.discussion.comment_count > 0 ) {
				commentTitle = this.translate( '%(count)s Comment', '%(count)s Comments', {
					count: post.discussion.comment_count,
					args: {
						count: post.discussion.comment_count
					}
				} );
				commentCountDisplay = this.numberFormat( post.discussion.comment_count );
			} else {
				if ( post.discussion.comments_open ) {
					commentTitle = this.translate( 'Comments' );
				} else {
					// No comments recorded & they're disabled, don't show the icon
					showComments = false;
				}
			}
			if ( showComments ) {
				commentMeta = (
					<a
						href={ commentHref }
						className={
							classNames( {
								post__comments: true,
								"is-empty": ! commentCountDisplay
							} )
						}
						target="_blank"
						title={ commentTitle }
						onClick={ this.analyticsEvents.commentIconClick }
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
			} else {
				if ( post.likes_enabled ) {
					likeTitle = this.translate( 'Likes' );
				} else {
					// No likes recorded & they're disabled, don't show the icon
					showLikes = false;
				}
			}
			if ( showLikes ) {
				likeMeta = (
					<a
						href={ post.URL }
						className={ classNames( {
							post__likes: true,
							"is-empty": ! likeCountDisplay
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
				var itemKey = 'meta-' + postId + '-' + i;
				return ( <li key={ itemKey }>{ item }</li> );
			}, this );

			return ( <ul className="post__meta">{ footerMetaItems }</ul> );
		}
	},

	getContentLinkURL: function() {
		var post = this.props.post,
			site = this.getSite(),
			contentLinkURL;

		if ( utils.userCan( 'edit_post', post ) ) {
			contentLinkURL = utils.getEditURL( post, site );
		} else if ( post.status === 'trash' ) {
			contentLinkURL = null;
		} else {
			contentLinkURL = post.URL;
		}

		return contentLinkURL;
	},

	getContentLinkTarget: function() {
		if ( config.isEnabled( 'post-editor' ) &&
				utils.userCan( 'edit_post', this.props.post ) ) {
			return null;
		}

		return '_blank';
	},

	toggleMoreControls: function( visibility ) {
		this.setState( {
			showMoreOptions: ( visibility === 'show' )
		} );
	},

	getSite: function() {
		return this.props.sites.getSite( this.props.post.site_ID );
	},

	render: function() {

		var site = this.getSite();

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
				/>
				<ReactCSSTransitionGroup
					transitionName="updated-trans"
					transitionEnterTimeout={ 300 }
					transitionLeaveTimeout={ 300 }>
					{ this.buildUpdateTemplate() }
				</ReactCSSTransitionGroup>
			</Card>
		);

	}

});
