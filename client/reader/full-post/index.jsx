/**
 * External Dependencies
 */
var ReactDom = require( 'react-dom' ),
	React = require( 'react/addons' ),
	assign = require( 'lodash/object/assign' ),
	classes = require( 'component-classes' ),
	debug = require( 'debug' )( 'calypso:reader-full-post' ), //eslint-disable-line no-unused-vars
	moment = require( 'moment' ),
	omit = require( 'lodash/object/omit' ),
	twemoji = require( 'twemoji' );

/**
 * Internal Dependencies
 */
var analytics = require( 'analytics' ),
	CommentButton = require( 'components/comment-button' ),
	CommentStore = require( 'lib/comment-store/comment-store' ),
	Dialog = require( 'components/dialog' ),
	DISPLAY_TYPES = require( 'lib/feed-post-store/display-types' ),
	ExternalLink = require( 'components/external-link' ),
	LikeButton = require( 'reader/like-button' ),
	PostByline = require( 'reader/post-byline' ),
	PostCommentHelper = require( 'reader/comments/helper' ),
	PostCommentList = require( '../comments/index' ),
	PostOptions = require( 'reader/post-options' ),
	PostErrors = require( 'reader/post-errors' ),
	PostStore = require( 'lib/feed-post-store' ),
	PostStoreActions = require( 'lib/feed-post-store/actions' ),
	SiteIcon = require( 'components/site-icon' ),
	SiteLink = require( 'reader/site-link' ),
	SiteState = require( 'lib/reader-site-store/constants' ).state,
	SiteStore = require( 'lib/reader-site-store' ),
	SiteStoreActions = require( 'lib/reader-site-store/actions' ),
	utils = require( 'reader/utils' ),
	LikeHelper = require( 'reader/like-helper' ),
	CommentStore = require( 'lib/comment-store/comment-store' ),
	stats = require( 'reader/stats' ),
	PostExcerptLink = require( 'reader/post-excerpt-link' ),
	ShareButton = require( 'reader/share' ),
	DiscoverHelper = require( 'reader/discover/helper' ),
	DiscoverVisitLink = require( 'reader/discover/visit-link' );

var loadingPost = {
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

function readerPageView( blogId, blogUrl, postId, isPrivate ) {
	debug( 'reader page view: %s (%d): %d [private:%s]', blogUrl, blogId, postId, isPrivate );
	let params = {
		ref: 'http://wordpress.com/',
		reader: 1,
		host: blogUrl.replace( /.*?:\/\//g, '' ),
		blog: blogId,
		post: postId
	};
	if ( isPrivate ) {
		params.priv = 1;
	}
	analytics.mc.bumpStatWithPageView( params );
}

/**
 * The content of a FullPostView
 */
FullPostView = React.createClass( {

	mixins: [ React.addons.PureRenderMixin ],

	componentDidMount: function() {
		this._parseEmoji();
	},

	componentDidUpdate: function() {
		this._parseEmoji();
	},

	scrollToComments: function() {
		if ( ! this.isMounted() ) {
			return;
		}
		let commentListNode = ReactDom.findDOMNode( this.refs.commentList );
		if ( commentListNode ) {
			commentListNode.scrollIntoView( { behavior: 'smooth' } );
		}
	},

	handlePermalinkClick: function() {
		stats.recordPermalinkClick( 'full_post_title' );
	},

	render: function() {
		var post = this.props.post,
			site = this.props.site,
			hasFeaturedImage = post &&
				! ( post.display_type & DISPLAY_TYPES.CANONICAL_IN_CONTENT ) &&
				post.canonical_image &&
				this.props.post.canonical_image.width > 620,
			articleClasses = [ 'reader__full-post' ],
			postContent,
			shouldShowExcerptOnly = ( post.use_excerpt ? post.use_excerpt : false ),
			siteName = utils.siteNameFromSiteAndPost( site, post ),
			isDiscoverPost = DiscoverHelper.isDiscoverPost( post ),
			discoverSiteUrl,
			discoverSiteName;

		if ( isDiscoverPost ) {
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
		}

		if ( hasFeaturedImage ) {
			articleClasses.push( 'has-featured-image' );
		}

		articleClasses = articleClasses.join( ' ' );

		if ( post.use_excerpt ) {
			postContent = post.excerpt;
		} else {
			postContent = post.content;
		}

		return (
			<div>
				<article className={ articleClasses } id="modal-full-post" ref="article">

					<PostErrors post={ post } />

					{ hasFeaturedImage ?
						<div className="full-post__featured-image test">
							<img src={ this.props.post.canonical_image.uri } height={ this.props.post.canonical_image.height } width={ this.props.post.canonical_image.width } />
						</div> : null }

					{ post.title ? <h1 className="reader__post-title" onClick={ this.handlePermalinkClick }><ExternalLink className="reader__post-title-link" href={ post.URL } target="_blank" icon={ false }>{ post.title }</ExternalLink></h1> : null }

					<PostByline post={ post } site={ site } icon={ true }/>

					<div className="reader__full-post-content" dangerouslySetInnerHTML={{ __html: postContent }}></div>

					{ shouldShowExcerptOnly && ! isDiscoverPost ? <PostExcerptLink siteName={ siteName } postUrl={ post.URL } /> : null }
					{ isDiscoverPost ? <DiscoverVisitLink siteName={ discoverSiteName } siteUrl={ discoverSiteUrl } /> : null }
					{ this.props.shouldShowComments ? <PostCommentList ref="commentList" post={ post } /> : null }
				</article>
			</div>
		);
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

	mixins: [ React.addons.PureRenderMixin ],

	componentWillMount: function() {
		classes( document.documentElement ).add( 'detail-page-active' );
	},

	componentWillUnmount: function() {
		classes( document.documentElement ).remove( 'detail-page-active' );
	},

	componentWillUpdate: function( nextProps ) {
		var action = nextProps.isVisible ? 'add' : 'remove',
			currentID = this.props.post && ( this.props.post.feed_item_ID || this.props.post.ID ),
			nextID = nextProps.post && ( nextProps.post.feed_item_ID || nextProps.post.ID ),
			detailPageContent;
		classes( document.documentElement )[ action ]( 'detail-page-open' );
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
	},

	handleClose: function( action ) {
		stats.recordAction( 'modal_close' );
		stats.recordGaEvent( 'Closed Full Post Dialog', action || 'backdrop' );
		this.props.onClose( action );
	},

	handleClickOutside: function( event ) {
		event.preventDefault();
	},

	render: function() {
		var post = this.props.post,
			site = this.props.site,
			shouldShowComments = false,
			shouldShowLikes = false,
			buttons = [
				{
					label: this.translate( 'Back', { context: 'Go back in browser history' } ),
					action: 'close',
					isPrimary: true
				}
			], siteName, siteLink;

		siteName = utils.siteNameFromSiteAndPost( site, post );

		siteLink = this.props.suppressSiteNameLink ?
			siteName :
			( <SiteLink post={ post }>{ siteName }</SiteLink> );

		if ( post && ! post._state ) {
			shouldShowComments = PostCommentHelper.shouldShowComments( post );
			shouldShowLikes = LikeHelper.shouldShowLikes( post );

			buttons.push(
				<div className="full-post__site" key="site-name">
					<SiteIcon site={ site && site.toJS() } size={ 24 } />
					<span className="full-post__site-name">{ siteLink }</span>
				</div>
			);

			buttons.push( <PostOptions key="post-options" post={ post } site={ site } onBlock={ this.props.onClose } /> );

			if ( shouldShowLikes ) {
				buttons.push( <LikeButton key="like-button" siteId={ post.site_ID } postId={ post.ID } tagName="div" forceCounter={ true } /> );
			}

			if ( shouldShowComments ) {
				buttons.push( <CommentButton key="comment-button" commentCount={ this.props.commentCount } onClick={ this.handleCommentButtonClick } tagName="div" /> );
			}

			buttons.push( <ShareButton post={ post } position="bottom left" tagName="div" /> );
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
				onClickOutside= { this.handleClickOutside}
				onClosed={ this.props.onClosed } >
				<FullPostView
					ref="fullPost"
					post={ this.props.post }
					site={ this.props.site }
					shouldShowComments={ shouldShowComments }
				/>
			</Dialog>
		);
	}

} );

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

FullPostContainer = React.createClass( {

	mixins: [ React.addons.PureRenderMixin ],

	getInitialState: function() {
		return assign( { isVisible: false }, this.getStateFromStores() );
	},

	getStateFromStores: function( props ) {
		var post, site, title, commentCount;

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

		if ( post && post.site_ID && post.ID ) {
			commentCount = CommentStore.getCommentCountForPost(
				post.site_ID,
				post.ID
			);
		}

		if ( post && post.site_ID && ! post.is_external ) {
			site = getSite( post.site_ID );
		}

		return { post, site, title, commentCount };
	},

	attemptToSendPageView: function() {
		var post = this.state.post,
			site = this.state.site,
			isNotAdmin = ! ( site && site.getIn( [ 'capabilities', 'manage_options' ], false ) );

		if ( ! this.hasSentPageView &&
				post &&
				site && site.get( 'state' ) === SiteState.COMPLETE &&
				( site.get( 'is_private' ) || isNotAdmin ) ) {
			readerPageView( site.get( 'ID' ), site.get( 'URL' ), post.ID, site.get( 'is_private' ) );
			this.hasSentPageView = true;
		}

		analytics.tracks.recordEvent( 'calypso_reader_article_opened' );
	},

	// Add change listeners to stores
	componentDidMount: function() {
		PostStore.on( 'change', this._onChange );
		CommentStore.on( 'change', this._onChange );
		SiteStore.on( 'change', this._onChange );

		this.hasSentPageView = false;

		this.attemptToSendPageView();

		// This is a trick to make the dialog animations happy. We have to initially render the dialog
		// as hidden, then set it to visible to trigger the animation.
		process.nextTick( function() {
			this.setState( { isVisible: true } );
		}.bind( this ) );
	},

	componentWillReceiveProps: function( nextProps ) {
		this.setState( this.getStateFromStores( nextProps ) );
	},

	componentDidUpdate: function( prevProps ) {
		if ( prevProps.postId !== this.props.postId ||
			prevProps.feedId !== this.props.feedId ||
			prevProps.blogId !== this.props.blogId ) {
			this.hasSentPageView = false;
			this.attemptToSendPageView();
		}
	},

	// Remove change listeners from stores
	componentWillUnmount: function() {
		PostStore.off( 'change', this._onChange );
		CommentStore.off( 'change', this._onChange );
		SiteStore.off( 'change', this._onChange );
	},

	_onChange: function() {
		var newState = this.getStateFromStores();
		if ( newState.post !== this.state.post || newState.site !== this.state.site || newState.title !== this.state.title ) {
			this.setState( newState );
			this.attemptToSendPageView();
		}
	},

	render: function() {
		var passedProps = omit( this.props, [ 'postId', 'feedId' ] );

		if ( this.props.setPageTitle && this.state.isVisible ) { // only set the title if we're visible
			this.props.setPageTitle( this.state.title );
		}

		return (

			<FullPostDialog {...passedProps }
				isVisible={ this.state.isVisible }
				post={ this.state.post }
				commentCount={ this.state.commentCount }
				site={ this.state.site } />
		);
	}

} );

module.exports = FullPostContainer;
