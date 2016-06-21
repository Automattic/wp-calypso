/**
 * External Dependencies
 */
var ReactDom = require( 'react-dom' ),
	React = require( 'react' ),
	PureRenderMixin = require( 'react-pure-render/mixin' ),
	defer = require( 'lodash/defer' ),
	closest = require( 'component-closest' ),
	debug = require( 'debug' )( 'calypso:reader-full-post' ), //eslint-disable-line no-unused-vars
	moment = require( 'moment' ),
	omit = require( 'lodash/omit' ),
	twemoji = require( 'twemoji' ),
	page = require( 'page' ),
	bindActionCreators = require( 'redux' ).bindActionCreators,
	connect = require( 'react-redux' ).connect;

/**
 * Internal Dependencies
 */
var abtest = require( 'lib/abtest' ).abtest,
	config = require( 'config' ),
	CommentButton = require( 'components/comment-button' ),
	Dialog = require( 'components/dialog' ),
	DISPLAY_TYPES = require( 'lib/feed-post-store/display-types' ),
	EmbedContainer = require( 'components/embed-container' ),
	ExternalLink = require( 'components/external-link' ),
	LikeButton = require( 'reader/like-button' ),
	PostByline = require( 'reader/post-byline' ),
	PostCommentHelper = require( 'reader/comments/helper' ),
	PostCommentList = require( '../comments/index' ),
	PostOptions = require( 'reader/post-options' ),
	PostErrors = require( 'reader/post-errors' ),
	PostStore = require( 'lib/feed-post-store' ),
	PostStoreActions = require( 'lib/feed-post-store/actions' ),
	Site = require( 'my-sites/site' ),
	SiteState = require( 'lib/reader-site-store/constants' ).state,
	SiteStore = require( 'lib/reader-site-store' ),
	SiteStoreActions = require( 'lib/reader-site-store/actions' ),
	FeedStore = require( 'lib/feed-store' ),
	FeedStoreActions = require( 'lib/feed-store/actions' ),
	FollowButton = require( 'reader/follow-button' ),
	utils = require( 'reader/utils' ),
	LikeHelper = require( 'reader/like-helper' ),
	stats = require( 'reader/stats' ),
	PostExcerptLink = require( 'reader/post-excerpt-link' ),
	ShareButton = require( 'reader/share' ),
	ShareHelper = require( 'reader/share/helper' ),
	DiscoverHelper = require( 'reader/discover/helper' ),
	DiscoverVisitLink = require( 'reader/discover/visit-link' ),
	readerRoute = require( 'reader/route' ),
	showReaderFullPost = require( 'state/ui/reader/fullpost/actions' ).showReaderFullPost,
	smartSetState = require( 'lib/react-smart-set-state' ),
	scrollTo = require( 'lib/scroll-to' );

import PostExcerpt from 'components/post-excerpt';
import { getPostTotalCommentsCount } from 'state/comments/selectors';
import RelatedPosts from 'components/related-posts';

let loadingPost = {
		URL: '',
		title: 'hi there',
		author: {
			name: '',
			URL: ''
		},
		content: '<p>Loading...</p>',
		comment_count: 0,
		date: moment().toISOString(),
		site_name: ''
	},
	postNotFound = {
		URL: '',
		title: '404: No Post Found',
		content: '<p>No post could be found.</p>'
	},
	errorPost = {
		URL: '',
		title: 'Error',
		content: '<p>Error Loading Post</p>'
	},
	FullPostView, FullPostDialog, FullPostContainer;

const relatedPostsEnabled = config.isEnabled( 'reader/related-posts' );

/**
 * The content of a FullPostView
 */
FullPostView = React.createClass( {

	mixins: [ PureRenderMixin ],

	hasScrolledToAnchor: false,

	componentDidMount: function() {
		this._parseEmoji();
		this.checkForCommentAnchor();
	},

	componentDidUpdate: function() {
		this._parseEmoji();
		this.checkForCommentAnchor();
	},

	componentWillReceiveProps( newProps ) {
		if ( newProps.shouldShowComments ) {
			this.checkForCommentAnchor();
		}
	},

	// if comments updated and we have not scrolled to the anchor yet, then scroll
	checkForCommentAnchor: function() {
		const hash = window.location.hash.substr( 1 );
		if ( this.refs.commentList && hash.indexOf( 'comments' ) > -1 && ! this.hasScrolledToAnchor ) {
			this.scrollToComments();
		}
	},

	scrollToComments: function() {
		if ( ! this.isMounted() ) {
			return;
		}
		let commentListNode = ReactDom.findDOMNode( this.refs.commentList );
		if ( commentListNode ) {
			this.hasScrolledToAnchor = true;
			const top = commentListNode.offsetTop;
			scrollTo( {
				x: 0,
				y: top - 48,
				duration: 250,
				container: document.querySelector( '.detail-page__content' )
			} );
		}
	},

	handlePermalinkClick: function() {
		stats.recordPermalinkClick( 'full_post_title' );
	},

	pickSite: function( event ) {
		if ( utils.isSpecialClick( event ) ) {
			return;
		}

		const url = readerRoute.getStreamUrlFromPost( this.props.post );
		page.show( url );
	},

	handleSiteClick: function( event ) {
		if ( ! utils.isSpecialClick( event ) ) {
			event.preventDefault();
		}
	},

	render: function() {
		var post = this.props.post,
			site = this.props.site,
			siteish = utils.siteishFromSiteAndPost( site, post ),
			feed = this.props.feed,
			hasFeaturedImage = post &&
				post.canonical_image &&
				! ( post.display_type & DISPLAY_TYPES.CANONICAL_IN_CONTENT ),
			articleClasses = [ 'reader__full-post' ],
			shouldShowExcerptOnly = ( post && post.use_excerpt ? post.use_excerpt : false ),
			siteName = utils.siteNameFromSiteAndPost( site, post ),
			isDiscoverPost = DiscoverHelper.isDiscoverPost( post ),
			discoverSiteUrl,
			discoverSiteName;

		if ( isDiscoverPost && post.discover_metadata ) {
			discoverSiteUrl = DiscoverHelper.getSiteUrl( post );
			discoverSiteName = post.discover_metadata.attribution.blog_name;
		}

		if ( ! post || post._state === 'minimal' || post._state === 'pending' ) {
			post = loadingPost;
			articleClasses.push( 'is-placeholder' );
		} else if ( post._state === 'error' ) {
			if ( post.statusCode === 404 ) {
				post = postNotFound;
			} else {
				post = errorPost;
			}
		} else {
			if ( post.site_ID ) {
				articleClasses.push( 'blog-' + post.site_ID );
			}
			if ( post.feed_ID ) {
				articleClasses.push( 'feed-' + post.feed_ID );
			}
		}

		if ( hasFeaturedImage ) {
			articleClasses.push( 'has-featured-image' );
		}

		articleClasses = articleClasses.join( ' ' );

		/*eslint-disable react/no-danger*/
		return (
			<div>
				<article className={ articleClasses } id="modal-full-post" ref="article">

					<PostErrors post={ post } />

					<div className="full-post__header">
						<Site site={ siteish }
							href={ post.site_URL }
							onSelect={ this.pickSite }
							onClick={ this.handleSiteClick } />

						{ feed && feed.feed_URL && <FollowButton siteUrl={ feed && feed.feed_URL } /> }
					</div>

					{ hasFeaturedImage
						? <div className="full-post__featured-image">
								<img src={ this.props.post.canonical_image.uri } height={ this.props.post.canonical_image.height } width={ 	this.props.post.canonical_image.width } />
							</div>
						: null }

					{ post.title ? <h1 className="reader__post-title" onClick={ this.handlePermalinkClick }><ExternalLink className="reader__post-title-link" href={ post.URL } target="_blank" icon={ false }>{ post.title }</ExternalLink></h1> : null }

					<PostByline post={ post } site={ site } icon={ true }/>

					{ post && post.use_excerpt
						? <PostExcerpt content={ post.better_excerpt ? post.better_excerpt : post.excerpt } />
						: <EmbedContainer>
								<div className="reader__full-post-content" dangerouslySetInnerHTML={ { __html: post.content } } />
							</EmbedContainer>
					}

					{ shouldShowExcerptOnly && ! isDiscoverPost ? <PostExcerptLink siteName={ siteName } postUrl={ post.URL } /> : null }
					{ discoverSiteName && discoverSiteUrl ? <DiscoverVisitLink siteName={ discoverSiteName } siteUrl={ discoverSiteUrl } /> : null }
					{ relatedPostsEnabled && ! post.is_external && post.site_ID && <RelatedPosts siteId={ post.site_ID } postId={ post.ID } onPostClick={ this.recordRelatedPostClicks } onSiteClick={ this.recordRelatedPostSiteClicks }/> }
					{ this.props.shouldShowComments ? <PostCommentList ref="commentList" post={ post } initialSize={ 25 } pageSize={ 25 } onCommentsUpdate={ this.checkForCommentAnchor } /> : null }
				</article>
			</div>
		);
		/*eslint-enable react/no-danger*/
	},

	recordRelatedPostClicks: function( post ) {
		stats.recordTrackForPost( 'calypso_reader_related_post_clicked', post );
	},

	recordRelatedPostSiteClicks: function( site, post ) {
		stats.recordTrackForPost( 'calypso_reader_related_post_site_clicked', post );
	},

	_generateButtonClickHandler: function( clickHandler ) {
		return function( event ) {
			event.preventDefault();
			clickHandler();
		};
	},

	_parseEmoji: function() {
		twemoji.parse( ReactDom.findDOMNode( this.refs.article ) );
	}

} );

/**
 * A user of the Dialog component.
 *
 * This handles events from the Dialog and sets up our special classes on the documentElement.
 * This class is required because the Dialog renders outside the normal render tree.
 * Originally, all of this code was part of FullPostView, but that meant that we could not get
 * access to the actual rendered DOM for the parts of the FullPostView without reaching up into the Dialog.
 *
 * By splitting the Dialog host from the content contained by the Dialog, the content can act in a normal manner
 * and use the standard lifecycle events and refs.
 */
FullPostDialog = React.createClass( {

	mixins: [ PureRenderMixin ],

	componentWillMount: function() {
		document.documentElement.classList.add( 'detail-page-active' );
	},

	componentWillUnmount: function() {
		document.documentElement.classList.remove( 'detail-page-active' );
	},

	componentWillUpdate: function( nextProps ) {
		var action = nextProps.isVisible ? 'add' : 'remove',
			currentID = this.props.post && ( this.props.post.feed_item_ID || this.props.post.ID ),
			nextID = nextProps.post && ( nextProps.post.feed_item_ID || nextProps.post.ID ),
			detailPageContent;
		document.documentElement.classList[ action ]( 'detail-page-open' );
		if ( currentID !== nextID ) {
			detailPageContent = document.querySelector( '.detail-page__content' );
			if ( detailPageContent ) {
				detailPageContent.scrollTop = 0;
			}
		}
	},

	handleCommentButtonClick: function() {
		this.refs.fullPost.scrollToComments();
		stats.recordAction( 'click_comments' );
		stats.recordGaEvent( 'Clicked Post Comment Button' );
		stats.recordTrackForPost( 'calypso_reader_full_post_comments_button_clicked', this.props.post );
	},

	handleClose: function( action ) {
		stats.recordAction( 'full_post_close' );
		stats.recordGaEvent( 'Closed Full Post Dialog', action || 'backdrop' );
		stats.recordTrackForPost( 'calypso_reader_article_closed', this.props.post );
		this.props.onClose( action );
	},

	handleClickOutside: function( event ) {
		if ( closest( event.target, '.popover' ) ) {
			return true;
		}
	},

	render: function() {
		var post = this.props.post,
			site = this.props.site,
			shouldShowComments = false,
			shouldShowLikes = false,
			shouldShowShare = false,
			buttons = [
				{
					label: this.translate( 'Back', { context: 'Go back in browser history' } ),
					action: 'close',
					isPrimary: true
				}
			];

		if ( post && ! post._state ) {
			shouldShowComments = PostCommentHelper.shouldShowComments( post );
			shouldShowLikes = LikeHelper.shouldShowLikes( post );
			shouldShowShare = ShareHelper.shouldShowShare( post );

			buttons.push( <PostOptions key="post-options" position="bottom left" post={ post } site={ site } onBlock={ this.props.onClose } /> );

			if ( shouldShowLikes ) {
				buttons.push( <LikeButton key="like-button" siteId={ post.site_ID } postId={ post.ID } tagName="div" forceCounter={ true } /> );
			}

			if ( shouldShowComments ) {
				buttons.push( <CommentButton key="comment-button" commentCount={ this.props.commentCount } onClick={ this.handleCommentButtonClick } tagName="div" /> );
			}

			if ( shouldShowShare ) {
				buttons.push( <ShareButton post={ post } position="bottom" tagName="div" /> );
			}
		}

		buttons = buttons.map( function( button ) {
			if ( button.action ) {
				button.additionalClassNames = 'action-button detail-page-' + button.action;
			}
			return button;
		} );

		return (
			<Dialog
				isVisible={ this.props.isVisible }
				buttons={ buttons }
				baseClassName="detail-page"
				onClose={ this.handleClose }
				onClickOutside= { this.handleClickOutside }
				onClosed={ this.props.onClosed } >
				<FullPostView
					ref="fullPost"
					post={ this.props.post }
					site={ this.props.site }
					feed={ this.props.feed }
					shouldShowComments={ shouldShowComments } />
			</Dialog>
		);
	}

} );

FullPostDialog = connect(
	( state, ownProps ) => ( {
		commentCount: ownProps.post ? getPostTotalCommentsCount( state, ownProps.post.site_ID, ownProps.post.ID ) : 0
	} )
)( FullPostDialog );

function getPost( postKey ) {
	var post = PostStore.get( postKey );
	if ( ! post || post._state === 'minimal' ) {
		PostStoreActions.fetchPost( postKey );
	}
	return post;
}

function getSite( siteId ) {
	var site = SiteStore.get( siteId );
	if ( ! site ) {
		SiteStoreActions.fetch( siteId );
	}
	return site;
}

function getFeed( feedId ) {
	var feed = FeedStore.get( feedId );
	if ( ! feed ) {
		FeedStoreActions.fetch( feedId );
	}
	return feed;
}

FullPostContainer = React.createClass( {

	mixins: [ PureRenderMixin ],

	smartSetState: smartSetState,

	getInitialState: function() {
		return this.getStateFromStores();
	},

	getStateFromStores: function( props ) {
		var post, site, feed, title;

		props = props || this.props;

		if ( props.blogId ) {
			post = getPost( {
				blogId: props.blogId,
				postId: props.postId
			} );
		} else {
			post = getPost( {
				feedId: props.feedId,
				postId: props.postId
			} );
		}
		if ( post && post.title ) {
			title = post.title;
		} else {
			title = this.translate( 'Post' );
		}

		if ( post && post.site_ID && ! post.is_external ) {
			site = getSite( post.site_ID );
		}

		if ( post && post.feed_ID ) {
			feed = getFeed( post.feed_ID );
		}

		return { post, site, feed, title };
	},

	attemptToSendPageView: function() {
		var post = this.state.post,
			site = this.state.site;

		if ( post && post._state !== 'pending' &&
			site && site.get( 'state' ) === SiteState.COMPLETE &&
			! this.hasSentPageView ) {
			PostStoreActions.markSeen( this.state.post );
			this.hasSentPageView = true;
		}

		if ( ! this.hasLoaded && post && post._state !== 'pending' ) {
			stats.recordTrackForPost( 'calypso_reader_article_opened', post );
			this.hasLoaded = true;
		}
	},

	// Add change listeners to stores
	componentDidMount: function() {
		PostStore.on( 'change', this._onChange );
		SiteStore.on( 'change', this._onChange );
		FeedStore.on( 'change', this._onChange );

		this.hasSentPageView = false;
		this.hasLoaded = false;

		this.attemptToSendPageView();

		// This is a trick to make the dialog animations happy. We have to initially render the dialog
		// as hidden, then set it to visible to trigger the animation.
		defer( this.props.showReaderFullPost );
	},

	componentWillReceiveProps: function( nextProps ) {
		this.smartSetState( this.getStateFromStores( nextProps ) );
	},

	componentDidUpdate: function( prevProps ) {
		if ( prevProps.postId !== this.props.postId ||
			prevProps.feedId !== this.props.feedId ||
			prevProps.blogId !== this.props.blogId ) {
			this.hasSentPageView = false;
			this.hasLoaded = false;
			this.attemptToSendPageView();
		}
	},

	// Remove change listeners from stores
	componentWillUnmount: function() {
		PostStore.off( 'change', this._onChange );
		SiteStore.off( 'change', this._onChange );
		FeedStore.off( 'change', this._onChange );

		if ( utils.isPostNotFound( this.state.post ) ) {
			this.props.onPostNotFound();
		}
	},

	_onChange: function() {
		var newState = this.getStateFromStores();
		if ( this.smartSetState( newState ) ) {
			this.attemptToSendPageView();
		}
	},

	render: function() {
		var passedProps = omit( this.props, [ 'postId', 'feedId' ] ),
			post = this.state.post;

		if ( this.props.setPageTitle && this.props.isVisible ) { // only set the title if we're visible
			this.props.setPageTitle( this.state.title );
		}

		return (

			<FullPostDialog {...passedProps }
				isVisible={ utils.isPostNotFound( post ) ? false : this.props.isVisible }
				post={ post }
				site={ this.state.site }
				feed={ this.state.feed }/>
		);
	}

} );

export default connect(
	( state ) => ( {
		isVisible: state.ui.reader.fullpost.isVisible
	} ),
	( dispatch ) => bindActionCreators( {
		showReaderFullPost
	}, dispatch )
)( FullPostContainer );
