/**
 * External Dependencies
 */
const ReactDom = require( 'react-dom' ),
	React = require( 'react' ),
	PureRenderMixin = require( 'react-pure-render/mixin' ),
	assign = require( 'lodash/assign' ),
	classnames = require( 'classnames' ),
	closest = require( 'component-closest' ),
	//debug = require( 'debug' )( 'calypso:reader:following:post' ),
	head = require( 'lodash/head' ),
	filter = require( 'lodash/filter' ),
	forOwn = require( 'lodash/forOwn' ),
	startsWith = require( 'lodash/startsWith' ),
	twemoji = require( 'twemoji' ),
	get = require( 'lodash/get' ),
	page = require( 'page' );

/**
 * Internal Dependencies
 */
const
	Card = require( 'components/card' ),
	CommentButton = require( 'components/comment-button' ),
	DISPLAY_TYPES = require( 'lib/feed-post-store/display-types' ),
	EmbedContainer = require( 'components/embed-container' ),
	LikeButton = require( 'reader/like-button' ),
	ObserveWindowSizeMixin = require( 'lib/mixins/observe-window-resize' ),
	PostHeader = require( 'reader/post-header' ),
	PostByline = require( 'reader/post-byline' ),
	PostImages = require( 'reader/post-images' ),
	PostOptions = require( 'reader/post-options' ),
	PostErrors = require( 'reader/post-errors' ),
	PostExcerpt = require( 'components/post-excerpt' ),
	SiteStore = require( 'lib/reader-site-store' ),
	SiteStoreActions = require( 'lib/reader-site-store/actions' ),
	Share = require( 'reader/share' ),
	ShareHelper = require( 'reader/share/helper' ),
	utils = require( 'reader/utils' ),
	PostCommentHelper = require( 'reader/comments/helper' ),
	LikeHelper = require( 'reader/like-helper' ),
	EmbedHelper = require( 'reader/embed-helper' ),
	readerRoute = require( 'reader/route' ),
	stats = require( 'reader/stats' ),
	PostPermalink = require( 'reader/post-permalink' ),
	DiscoverPostAttribution = require( 'reader/discover/post-attribution' ),
	DiscoverSiteAttribution = require( 'reader/discover/site-attribution' ),
	DiscoverHelper = require( 'reader/discover/helper' ),
	FeedPostStore = require( 'lib/feed-post-store' ),
	FeedPostStoreActions = require( 'lib/feed-post-store/actions' ),
	Gridicon = require( 'components/gridicon' ),
	smartSetState = require( 'lib/react-smart-set-state' );

const Post = React.createClass( {

	mixins: [ PureRenderMixin, ObserveWindowSizeMixin ],

	propTypes: {
		post: React.PropTypes.object.isRequired,
		isSelected: React.PropTypes.bool.isRequired,
		xPostedTo: React.PropTypes.array,
		suppressSiteNameLink: React.PropTypes.bool,
		showPostHeader: React.PropTypes.bool,
		showFollowInHeader: React.PropTypes.bool,
		additionalClasses: React.PropTypes.object,
		handleClick: React.PropTypes.func.isRequired,
	},

	smartSetState: smartSetState,

	getMaxFeaturedWidthSize: function() {
		return ReactDom.findDOMNode( this ).offsetWidth;
	},

	shouldApplyIsLong: function() {
		var node = ReactDom.findDOMNode( this.refs.siteName );
		// give the clientWidth a 2 pixel buffer. IE is often off by at least one.
		return !! ( node && node.scrollWidth > ( node.offsetWidth + 2 ) );
	},

	onWindowResize: function() {
		this.updateFeatureSize();
		this.checkSiteNameForOverflow();
	},

	getInitialState: function() {
		return this.getStateFromStores();
	},

	getDefaultProps: function() {
		return {
			showFollowInHeader: false
		};
	},

	getStateFromStores: function( props ) {
		var post, siteId, site, originalPost, isDiscoverPost, isDiscoverSitePick;
		props = props || this.props;
		post = props.post;
		siteId = ! post.is_external && post.site_ID;
		isDiscoverPost = post && DiscoverHelper.isDiscoverPost( post );
		if ( isDiscoverPost ) {
			isDiscoverSitePick = post && DiscoverHelper.isDiscoverSitePick( post );
		}

		if ( siteId ) {
			site = SiteStore.get( siteId );
			if ( ! site ) {
				SiteStoreActions.fetch( siteId );
			}
		}

		// If it's a discover post (but not a site pick), we want the original post too
		if ( isDiscoverPost && ! isDiscoverSitePick && get( post, 'discover_metadata.featured_post_wpcom_data.blog_id' ) ) {
			originalPost = FeedPostStore.get( {
				blogId: post.discover_metadata.featured_post_wpcom_data.blog_id,
				postId: post.discover_metadata.featured_post_wpcom_data.post_id
			} );
		}

		return {
			site: site,
			siteish: utils.siteishFromSiteAndPost( site, post ),
			originalPost: originalPost,
			isDiscoverPost: isDiscoverPost,
			isDiscoverSitePick: isDiscoverSitePick
		};
	},

	componentDidMount: function() {
		this.updateFeatureSize();
		this.checkSiteNameForOverflow();
		this._parseEmoji();
		SiteStore.on( 'change', this.updateState );
	},

	componentWillUnmount: function() {
		SiteStore.off( 'change', this.updateState );
	},

	componentWillReceiveProps: function( nextProps ) {
		if ( nextProps.post !== this.props.post ) {
			this.updateState( nextProps );
		}
	},

	updateState: function( props ) {
		var newState = this.getStateFromStores( props );
		if ( newState.site !== this.state.site ) {
			this.smartSetState( newState );
		}
	},

	componentDidUpdate: function() {
		this.updateFeatureSize();
		this.checkSiteNameForOverflow();
		this._parseEmoji();
	},

	getFeaturedSize: function( available ) {
		available = available || this.getMaxFeaturedWidthSize();
		if ( this.featuredSizingStrategy ) {
			return this.featuredSizingStrategy( available );
		}
		return {};
	},

	featuredImageComponent: function( post ) {
		var featuredImage = ( post.canonical_image && post.canonical_image.uri ),
			featuredEmbed = head( filter( post.content_embeds, ( embed ) => {
				return ! startsWith( embed.type, 'special-' );
			} ) ),
			maxWidth = Math.min( 653, window.innerWidth ),
			featuredSize, useFeaturedEmbed;

		if ( post.use_excerpt ) {
			// don't feature embeds for excerpts
			featuredEmbed = null;
		}

		if ( ! ( featuredImage || featuredEmbed ) ) {
			return null;
		}

		// we only show a featured embed when all of these are true
		//   - there is no featured image on the post that's big enough to pass as the canonical image
		//   - there is an available embed
		//
		useFeaturedEmbed = featuredEmbed &&
			( ! featuredImage || ( featuredImage !== post.featured_image ) );
		if ( useFeaturedEmbed ) {
			this.featuredSizingStrategy = EmbedHelper.getEmbedSizingFunction( featuredEmbed );
		} else if ( featuredImage && post.canonical_image.width >= maxWidth ) {
			this.featuredSizingStrategy = function featuredImageSizingFunction( availible ) {
				var aspectRatio = post.canonical_image.width / post.canonical_image.height;

				return {
					width: availible + 'px',
					height: Math.floor( availible / aspectRatio ) + 'px'
				};
			};

			featuredSize = this.getFeaturedSize( maxWidth );
		}

		return useFeaturedEmbed
			? <div
					ref="featuredEmbed"
					className="reader__post-featured-video"
					key="featuredVideo"
					dangerouslySetInnerHTML={ { __html: featuredEmbed.iframe } } />  //eslint-disable-line react/no-danger
			: <div
					className="reader__post-featured-image"
					onClick={ this.handlePermalinkClick }>
				{ featuredSize
					? <img className="reader__post-featured-image-image"
							ref="featuredImage"
							src={ featuredImage }
							style={ featuredSize }
						/>
					: <img className="reader__post-featured-image-image" src={ featuredImage } />
				}
			</div>;
	},

	updateFeatureSize: function() {
		var node;
		if ( this.refs.featuredImage ) {
			node = ReactDom.findDOMNode( this.refs.featuredImage );
		} else if ( this.refs.featuredEmbed ) {
			node = ReactDom.findDOMNode( this.refs.featuredEmbed ).querySelector( 'iframe' );
		}

		if ( node ) {
			assign( node.style, this.getFeaturedSize() );
		}
	},

	checkSiteNameForOverflow: function() {
		var headerNode = ReactDom.findDOMNode( this.refs.siteName );
		if ( ! headerNode ) {
			return;
		}
		headerNode.classList.toggle( 'is-long', this.shouldApplyIsLong() );
	},

	propagateCardClick: function( options = {} ) {
		let postToOpen = this.props.post;
		// For Discover posts (but not site picks), open the original post in full post view
		if ( this.state.originalPost ) {
			postToOpen = this.state.originalPost;
		}

		this.props.handleClick( postToOpen, options );
	},

	handleCardClick: function( event ) {
		var rootNode = ReactDom.findDOMNode( this );

		// if the click has modifier or was not primary, ignore it
		if ( event.button > 0 || event.metaKey || event.controlKey || event.shiftKey || event.altKey ) {
			if ( closest( event.target, '.reader__post-title-link', true, rootNode ) ) {
				stats.recordPermalinkClick( 'card_title_with_modifier' );
				stats.recordGaEvent( 'Clicked Post Permalink with Modifier' );
			}
			return;
		}

		if ( closest( event.target, '.should-scroll', true, rootNode ) ) {
			setTimeout( function() {
				window.scrollTo( 0, 0 );
			}, 100 );
		}

		// declarative ignore
		if ( closest( event.target, '.ignore-click, [rel=external]', true, rootNode ) ) {
			return;
		}

		// ignore clicks on anchors inside inline content
		if ( closest( event.target, 'a', true, rootNode ) && closest( event.target, '.reader__full-post-content', true, rootNode ) ) {
			return;
		}

		// programattic ignore
		if ( ! event.defaultPrevented ) { // some child handled it
			event.preventDefault();
			this.propagateCardClick();
		}
	},

	handleCommentButtonClick: function() {
		stats.recordAction( 'click_comments' );
		stats.recordGaEvent( 'Clicked Post Comment Button' );
		stats.recordTrackForPost( 'calypso_reader_post_comments_button_clicked', this.props.post );
		this.propagateCardClick( { comments: true } );
	},

	_parseEmoji: function() {
		twemoji.parse( ReactDom.findDOMNode( this ) );
	},

	pickSite: function( event ) {
		// ugh, double negative. If we should let the site click go, bail.
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

	maybeMarkPostSeen: function( liked ) {
		if ( liked ) {
			FeedPostStoreActions.markSeen( this.props.post );
		}
	},

	render: function() {
		var post = this.props.post,
			site = this.state.siteish,
			featuredImage = this.featuredImageComponent( post ),
			shouldShowComments = PostCommentHelper.shouldShowComments( post ),
			shouldShowLikes = LikeHelper.shouldShowLikes( post ),
			shouldShowShare = ShareHelper.shouldShowShare( post ),
			hasFeaturedImage = featuredImage !== null,
			articleClasses = assign( {
				reader__card: true,
				'has-featured-image': hasFeaturedImage,
				'hide-xpost': this.props.xPostedTo
			}, this.additionalClasses ),
			primaryTag = post.primary_tag,
			tagClasses = {
				'reader__post-tag': true,
				'is-long': ( primaryTag && primaryTag.name.length > 25 )
			},
			shouldShowExcerptOnly = !! post.use_excerpt,
			shouldUseFullExcerpt = ! shouldShowExcerptOnly && ( post.display_type & DISPLAY_TYPES.ONE_LINER ),
			siteName = utils.siteNameFromSiteAndPost( this.state.site, post ),
			isDiscoverPost = this.state.isDiscoverPost,
			isDiscoverSitePick = this.state.isDiscoverSitePick,
			discoverSiteUrl,
			originalPost = this.state.originalPost,
			likeSiteId = ( originalPost ? originalPost.site_ID : post.site_ID ),
			likePostId = ( originalPost ? originalPost.ID : post.ID ),
			commentCount = ( originalPost ? originalPost.discussion.comment_count : post.discussion.comment_count ),
			xPostedToContent = null;

		forOwn( DISPLAY_TYPES, function( value, key ) {
			if ( post.display_type && ( post.display_type & value ) ) { // bitwise intentional
				articleClasses[ 'is-' + key.toLowerCase().replace( '_', '-' ) ] = true;
			}
		} );

		if ( shouldShowExcerptOnly ) {
			articleClasses[ 'is-excerpt-only' ] = true;
		}

		if ( this.props.isSelected ) {
			articleClasses[ 'is-selected' ] = true;
		}

		if ( post.site_ID ) {
			articleClasses[ 'blog-' + post.site_ID ] = true;
		}

		if ( post.feed_ID ) {
			articleClasses[ 'feed-' + post.feed_ID ] = true;
		}

		if ( ! this.props.showPostHeader ) {
			articleClasses[ 'is-headerless' ] = true;
		}

		forOwn( post.tags, ( { slug } ) => {
			articleClasses[ 'tag-' + slug ] = true;
		} );

		articleClasses = classnames( articleClasses );

		tagClasses = classnames( tagClasses );

		if ( isDiscoverPost ) {
			discoverSiteUrl = DiscoverHelper.getSiteUrl( post );
		}

		if ( this.props.xPostedTo ) {
			xPostedToContent = this.props.xPostedTo.map( ( xPostedTo, index, array ) => {
				return (
					<span className="reader__x-post-site" key={ xPostedTo.siteURL + '-' + index } >
						<a href={ xPostedTo.siteURL }>{ xPostedTo.siteName }</a>
						{ index + 2 < array.length ? <span>, </span> : null }
						{ index + 2 === array.length ? <span> { this.translate( 'and', { comment: 'last conjuction in a list of blognames: (blog1, blog2,) blog3 _and_ blog4' } ) } </span> : null }
					</span>
				);
			} );
		}

		return (
			<Card tagName="article" onClick={ this.handleCardClick } className={ articleClasses }>

				<PostErrors post={ post } />

				{ this.props.showPostHeader ? <PostHeader site={ site } siteUrl={ post.site_URL } showFollow={ this.props.showFollowInHeader } onSiteSelect={ this.pickSite } onSiteClick={ this.handleSiteClick } /> : null }

				{ featuredImage }

				{ post.title ? <h1 className="reader__post-title"><a className="reader__post-title-link" href={ post.URL } target="_blank">{ post.title }</a></h1> : null }

				<PostByline post={ post } site={ this.props.site } />

				{ shouldUseFullExcerpt
					? <EmbedContainer>
							<div key="full-post-inline"
								className="reader__full-post-content"
								dangerouslySetInnerHTML={ // eslint-disable-line react/no-danger
									{ __html: post.content }
								} />
						</EmbedContainer>
					: <PostExcerpt content={ post.better_excerpt ? post.better_excerpt : post.excerpt } />
				}

				{ ! shouldShowExcerptOnly
					? <PostImages postImages={ post.content_images || [] } />
					: null }

				{ ( isDiscoverPost && post.discover_metadata && ! isDiscoverSitePick ) ? <DiscoverPostAttribution attribution={ post.discover_metadata.attribution } siteUrl={ discoverSiteUrl } /> : null }
				{ ( isDiscoverSitePick ) ? <DiscoverSiteAttribution attribution={ post.discover_metadata.attribution } siteUrl={ discoverSiteUrl } /> : null }

				{ this.props.xPostedTo
					? <div className="reader__x-post-to">
							<Gridicon icon="arrow-right" size={ 24 } />
							<span className="reader__x-post-label">{ this.translate( 'cross-posted to' ) } </span>
							{ xPostedToContent }
						</div>
					: null
				}

				<ul className="reader__post-footer">
					<PostPermalink siteName={ siteName } postUrl={ post.URL } />
					{ ( shouldShowShare ) ? <Share post={ post } /> : null }
					{ ( shouldShowComments ) ? <CommentButton onClick={ this.handleCommentButtonClick } commentCount={ commentCount } /> : null }
					{ ( shouldShowLikes ) ? <LikeButton siteId={ likeSiteId } postId={ likePostId } onLikeToggle={ this.maybeMarkPostSeen } /> : null }
					<li className="reader__post-options"><PostOptions post={ post } site={ this.state.site } /></li>
				</ul>
			</Card>
		);
	}

} );

module.exports = Post;
