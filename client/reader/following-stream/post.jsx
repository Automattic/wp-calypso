/**
 * External Dependencies
 */
var ReactDom = require( 'react-dom' ),
	React = require( 'react/addons' ),
	assign = require( 'lodash/object/assign' ),
	classnames = require( 'classnames' ),
	closest = require( 'component-closest' ),
	classes = require( 'component-classes' ),
	//debug = require( 'debug' )( 'calypso:reader:following:post' ),
	first = require( 'lodash/array/first' ),
	forOwn = require( 'lodash/object/forOwn' ),
	twemoji = require( 'twemoji' ),
	get = require( 'lodash/object/get' ),
	page = require( 'page' );

/**
 * Internal Dependencies
 */
var Card = require( 'components/card' ),
	CommentButton = require( 'components/comment-button' ),
	DISPLAY_TYPES = require( 'lib/feed-post-store/display-types' ),
	LikeButton = require( 'reader/like-button' ),
	ObserveWindowSizeMixin = require( 'lib/mixins/observe-window-resize' ),
	PostByline = require( 'reader/post-byline' ),
	PostImages = require( 'reader/post-images' ),
	PostOptions = require( 'reader/post-options' ),
	PostErrors = require( 'reader/post-errors' ),
	PostExcerpt = require( 'components/post-excerpt' ),
	Site = require( 'my-sites/site' ),
	SiteLink = require( 'reader/site-link' ),
	SiteStore = require( 'lib/reader-site-store' ),
	SiteStoreActions = require( 'lib/reader-site-store/actions' ),
	Share = require( 'reader/share' ),
	utils = require( 'reader/utils' ),
	PostCommentHelper = require( 'reader/comments/helper' ),
	FollowingEditHelper = require( 'reader/following-edit/helper' ),
	LikeHelper = require( 'reader/like-helper' ),
	stats = require( 'reader/stats' ),
	PostExcerptLink = require( 'reader/post-excerpt-link' ),
	PostPermalink = require( 'reader/post-permalink' ),
	DiscoverPostAttribution = require( 'reader/discover/post-attribution' ),
	DiscoverSiteAttribution = require( 'reader/discover/site-attribution' ),
	DiscoverHelper = require( 'reader/discover/helper' ),
	FeedPostStore = require( 'lib/feed-post-store' ),
	FollowButton = require( 'reader/follow-button' ),
	Gridicon = require( 'components/gridicon' );

var Post = React.createClass( {

	mixins: [ React.addons.PureRenderMixin, ObserveWindowSizeMixin ],

	propTypes: {
		post: React.PropTypes.object.isRequired,
		isSelected: React.PropTypes.bool.isRequired,
		xPostedTo: React.PropTypes.array,
		suppressSiteNameLink: React.PropTypes.bool,
		showFollowInHeader: React.PropTypes.bool,
		additionalClasses: React.PropTypes.object,
		handleClick: React.PropTypes.func.isRequired
	},

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
			this.setState( newState );
		}
	},

	componentDidUpdate: function() {
		this.updateFeatureSize();
		this.checkSiteNameForOverflow();
		this._parseEmoji();
	},

	getFeaturedSize: function( aspect, available ) {
		available = available || this.getMaxFeaturedWidthSize();
		return {
			width: available + 'px',
			height: Math.floor( available / aspect ) + 'px'
		};
	},

	featuredImageComponent: function( post ) {
		var featuredImage = ( post.canonical_image && post.canonical_image.uri ),
			featuredEmbed = first( post.content_embeds ),
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
		if ( useFeaturedEmbed && featuredEmbed.aspectRatio ) {
			this.featuredAspect = featuredEmbed.aspectRatio;
		} else if ( featuredImage && post.canonical_image.width >= maxWidth ) {
			this.featuredAspect = post.canonical_image.width / post.canonical_image.height;
			featuredSize = this.getFeaturedSize( this.featuredAspect, maxWidth );
		}

		return useFeaturedEmbed ?
			<div ref="featuredEmbed" className="reader__post-featured-video" key="featuredVideo" dangerouslySetInnerHTML={ { __html: featuredEmbed.iframe } } /> :
			<div className="reader__post-featured-image" onClick={ this.handlePermalinkClick }>
				{ featuredSize ?
					<img className="reader__post-featured-image-image"
						ref="featuredImage"
						src={ featuredImage }
						style={ featuredSize }
						/> :
					<img className="reader__post-featured-image-image" src={ featuredImage } />
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
			assign( node.style, this.getFeaturedSize( this.featuredAspect ) );
		}
	},

	checkSiteNameForOverflow: function() {
		var headerNode = ReactDom.findDOMNode( this.refs.siteName );
		if ( ! headerNode ) {
			return;
		}
		classes( headerNode ).toggle( 'is-long', this.shouldApplyIsLong() );
	},

	handleCardClick: function( event ) {
		var rootNode = ReactDom.findDOMNode( this ),
			post = this.props.post,
			isDiscoverPost = this.state.isDiscoverPost,
			postUrl = isDiscoverPost ? post.discover_metadata.permalink : post.URL,
			postToOpen = post;

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

		// For Discover posts (but not site picks), open the original post in full post view
		if ( this.state.originalPost ) {
			postToOpen = this.state.originalPost;
		}

		// programattic ignore
		if ( ! event.defaultPrevented ) { // some child handled it
			event.preventDefault();
			this.props.handleClick( postToOpen );
		}
	},

	recordCommentButtonClick: function() {
		stats.recordAction( 'click_comments' );
		stats.recordGaEvent( 'Clicked Post Comment Button' );
	},

	recordTagClick: function() {
		stats.recordAction( 'click_tag' );
		stats.recordGaEvent( 'Clicked Tag Link' );
	},

	_parseEmoji: function() {
		twemoji.parse( ReactDom.findDOMNode( this ) );
	},

	pickSite: function( event ) {
		if ( event.button > 0 || event.metaKey || event.controlKey || event.shiftKey || event.altKey ) {
			return;
		}
		const post = this.props.post;
		if ( post.feed_ID ) {
			page.show( '/read/blog/feed/' + post.feed_ID );
		} else {
			page.show( '/read/blog/id/' + post.site_ID );
		}
		event.preventDefault();
	},

	render: function() {
		var post = this.props.post,
			site = this.state.site && this.state.site.toJS(),
			featuredImage = this.featuredImageComponent( post ),
			shouldShowComments = PostCommentHelper.shouldShowComments( post ),
			shouldShowLikes = LikeHelper.shouldShowLikes( post ),
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
			siteTitleClasses = {
				'ignore-click': true,
				'should-scroll': true
			},
			siteNameClasses = classnames( { 'reader__site-name': true } ),
			siteLink,
			isDiscoverPost = this.state.isDiscoverPost,
			isDiscoverSitePick = this.state.isDiscoverSitePick,
			discoverSiteUrl,
			originalPost = this.state.originalPost,
			likeSiteId = ( originalPost ? originalPost.site_ID : post.site_ID ),
			likePostId = ( originalPost ? originalPost.ID : post.ID ),
			commentCount = ( originalPost ? originalPost.discussion.comment_count : post.discussion.comment_count ),
			xPostedToContent = null;

		if ( ! site ) {
			site = {
				title: siteName,
				domain: FollowingEditHelper.formatUrlForDisplay( post.site_URL )
			}
		}

		siteTitleClasses = classnames( siteTitleClasses );

		siteLink = this.props.suppressSiteNameLink ?
			siteName :
			( <SiteLink className={ siteTitleClasses } post={ post }>{ siteName }</SiteLink> );

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

				<div className="reader__post-header">
					{ this.props.showFollowInHeader ? <FollowButton siteUrl={ post.site_URL } /> : null }
					<Site site={ site } href={ post.site_URL } onSelect={ this.pickSite } />
				</div>

				{ featuredImage }

				{ post.title ? <h1 className="reader__post-title"><a className="reader__post-title-link" href={ post.URL } target="_blank">{ post.title }</a></h1> : null }

				<PostByline post={ post } site={ this.props.site } />

				{ shouldUseFullExcerpt ?
					<div key="full-post-inline" className="reader__full-post-content" dangerouslySetInnerHTML={{ __html: post.content }} ></div> :
					<PostExcerpt text={ post.excerpt } />
				}

				{ shouldShowExcerptOnly ?
					<PostExcerptLink siteName={ siteName } postUrl={ post.URL } /> : null }

				{ ! shouldShowExcerptOnly ?
					<PostImages postImages={ post.content_images || [] } /> : null }

				{ ( isDiscoverPost && ! isDiscoverSitePick ) ? <DiscoverPostAttribution attribution={ post.discover_metadata.attribution } siteUrl={ discoverSiteUrl } /> : null }
				{ ( isDiscoverSitePick ) ? <DiscoverSiteAttribution attribution={ post.discover_metadata.attribution } siteUrl={ discoverSiteUrl } /> : null }

				{ this.props.xPostedTo ?
					<div className="reader__x-post-to">
						<Gridicon icon="arrow-right" size={ 24 } />
						<span className="reader__x-post-label">{ this.translate( 'cross-posted to' ) } </span>
						{ xPostedToContent }
					</div> :
					null
				}

				<ul className="reader__post-footer">
					<Share post={ post } />
					<PostPermalink siteName={ siteName } postUrl={ post.URL } />
					{ ( shouldShowComments ) ? <CommentButton onClick={ this.recordCommentButtonClick } commentCount={ commentCount } /> : null }
					{ ( shouldShowLikes ) ? <LikeButton siteId={ likeSiteId } postId={ likePostId } /> : null }
					<li className="reader__post-options"><PostOptions post={ post } site={ this.state.site } /></li>
				</ul>
			</Card>
		);
	}

} );

module.exports = Post;
