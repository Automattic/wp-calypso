/**
 * External dependencies
 */
var ReactDom = require( 'react-dom' ),
	React = require( 'react' ),
	classnames = require( 'classnames' ),
	noop = require( 'lodash/noop' ),
	times = require( 'lodash/times' );

/**
 * Internal dependencies
 */
var Main = require( 'components/main' ),
	DISPLAY_TYPES = require( 'lib/feed-post-store/display-types' ),
	EmptyContent = require( './empty' ),
	FeedStreamStoreActions = require( 'lib/feed-stream-store/actions' ),
	FeedPostStoreActions = require( 'lib/feed-post-store/actions' ),
	ListGap = require( 'reader/list-gap' ),
	LikeStore = require( 'lib/like-store/like-store' ),
	LikeStoreActions = require( 'lib/like-store/actions' ),
	LikeHelper = require( 'reader/like-helper' ),
	InfiniteList = require( 'components/infinite-list' ),
	MobileBackToSidebar = require( 'components/mobile-back-to-sidebar' ),
	Post = require( './post' ),
	CrossPost = require( './x-post' ),
	page = require( 'page' ),
	PostUnavailable = require( './post-unavailable' ),
	PostPlaceholder = require( './post-placeholder' ),
	PostStore = require( 'lib/feed-post-store' ),
	UpdateNotice = require( 'reader/update-notice' ),
	PostBlocked = require( './post-blocked' ),
	KeyboardShortcuts = require( 'lib/keyboard-shortcuts' ),
	scrollTo = require( 'lib/scroll-to' ),
	XPostHelper = require( 'reader/xpost-helper' );

const GUESSED_POST_HEIGHT = 600,
	HEADER_OFFSET_TOP = 46;

module.exports = React.createClass( {
	displayName: 'ReaderFollowing',

	propTypes: {
		store: React.PropTypes.object.isRequired,
		trackScrollPage: React.PropTypes.func.isRequired,
		suppressSiteNameLink: React.PropTypes.bool,
		showPostHeader: React.PropTypes.bool,
		showFollowInHeader: React.PropTypes.bool,
		onUpdatesShown: React.PropTypes.func,
		emptyContent: React.PropTypes.object,
		className: React.PropTypes.string,
		showEmptyContent: React.PropTypes.bool,
		showPrimaryFollowButtonOnCards: React.PropTypes.bool,
		showMobileBackToSidebar: React.PropTypes.bool
	},

	getDefaultProps: function() {
		return {
			showPostHeader: true,
			suppressSiteNameLink: false,
			showFollowInHeader: false,
			onShowUpdates: noop,
			className: '',
			showEmptyContent: true,
			showPrimaryFollowButtonOnCards: false,
			showMobileBackToSidebar: true
		};
	},

	getInitialState: function() {
		return this.getStateFromStores();
	},

	getStateFromStores: function( store ) {
		store = store || this.props.store;
		return {
			posts: store.get(),
			updateCount: store.getUpdateCount(),
			selectedIndex: store.getSelectedIndex()
		};
	},

	updateState: function( store ) {
		this.setState( this.getStateFromStores( store ) );
	},

	componentDidUpdate: function( prevProps, prevState ) {
		if ( prevState.selectedIndex !== this.state.selectedIndex ) {
			this.scrollToSelectedPost( true );
			if ( this.isPostFullScreen() ) {
				this.showSelectedPost( { replaceHistory: true } );
			}
		}
	},

	_popstate: function() {
		if ( this.state.selectedIndex > -1 && history.scrollRestoration !== 'manual' ) {
			this.scrollToSelectedPost( false );
		}
	},

	cardClassForPost( post ) {
		if ( this.props.cardFactory ) {
			const externalPostClass = this.props.cardFactory( post );
			if ( externalPostClass ) {
				return externalPostClass;
			}
		}
		if ( post.display_type & DISPLAY_TYPES.X_POST ) {
			return CrossPost;
		}

		if ( post.is_site_blocked ) {
			return PostBlocked;
		}

		return Post;
	},

	scrollToSelectedPost: function( animate ) {
		var HEADER_OFFSET = -80, // a fixed position header means we can't just scroll the element into view.
			selectedNode,
			boundingClientRect,
			documentElement,
			windowTop,
			scrollY;
		selectedNode = ReactDom.findDOMNode( this ).querySelector( '.is-selected' );
		if ( selectedNode ) {
			documentElement = document.documentElement;
			selectedNode.focus();
			windowTop = ( window.pageYOffset || documentElement.scrollTop ) -
				( documentElement.clientTop || 0 );
			boundingClientRect = selectedNode.getBoundingClientRect();
			scrollY = parseInt( windowTop + boundingClientRect.top + HEADER_OFFSET, 10 );
			if ( animate ) {
				scrollTo( {
					x: 0,
					y: scrollY,
					duration: 200
				} );
			} else {
				window.scrollTo( 0, scrollY );
			}
		}
	},

	componentDidMount: function() {
		this.props.store.on( 'change', this.updateState );
		PostStore.on( 'change', this.updateState ); // should move this dep down into the individual items

		KeyboardShortcuts.on( 'move-selection-down', this.selectNextItem );
		KeyboardShortcuts.on( 'move-selection-up', this.selectPrevItem );
		KeyboardShortcuts.on( 'open-selection', this.showSelectedPost );
		KeyboardShortcuts.on( 'like-selection', this.toggleLikeOnSelectedPost );
		KeyboardShortcuts.on( 'go-to-top', this.goToTop );
		window.addEventListener( 'popstate', this._popstate );
		if ( 'scrollRestoration' in history ) {
			history.scrollRestoration = 'manual';
		}
	},

	componentWillUnmount: function() {
		this.props.store.off( 'change', this.updateState );
		PostStore.off( 'change', this.updateState );

		KeyboardShortcuts.off( 'move-selection-down', this.selectNextItem );
		KeyboardShortcuts.off( 'move-selection-up', this.selectPrevItem );
		KeyboardShortcuts.off( 'open-selection', this.showSelectedPost );
		KeyboardShortcuts.off( 'like-selection', this.toggleLikeOnSelectedPost );
		KeyboardShortcuts.off( 'go-to-top', this.goToTop );
		window.removeEventListener( 'popstate', this._popstate );
		if ( 'scrollRestoration' in history ) {
			history.scrollRestoration = 'auto';
		}
	},

	componentWillReceiveProps: function( nextProps ) {
		if ( nextProps.store !== this.props.store ) {
			this.props.store.off( 'change', this.updateState );
			nextProps.store.on( 'change', this.updateState );
			this.updateState( nextProps.store );
			this._list && this._list.reset();
		}
	},

	showSelectedPost: function( options ) {
		var postKey = this.props.store.getSelectedPost(),
			mappedPost;
		if ( !! postKey ) {
			// gap
			if ( postKey.isGap === true ) {
				return this._selectedGap.handleClick();
			}
			// xpost
			let post = PostStore.get( postKey );
			if ( this.cardClassForPost( post ) === CrossPost && ! options.replaceHistory ) {
				return this.showFullXPost( XPostHelper.getXPostMetadata( post ) );
			}
			// normal
			if ( !! postKey.feedId ) {
				mappedPost = {
					feed_ID: postKey.feedId,
					feed_item_ID: postKey.postId
				};
			} else {
				mappedPost = {
					site_ID: postKey.blogId,
					ID: postKey.postId
				};
			}
			this.showFullPost( mappedPost, options );
		}
	},

	toggleLikeOnSelectedPost: function() {
		const postKey = this.props.store.getSelectedPost();
		let post;

		if ( postKey && ! postKey.isGap ) {
			post = PostStore.get( postKey );
		}

		// only toggle a like on a x-post if we have the appropriate metadata,
		// and original post is full screen
		const xPostMetadata = XPostHelper.getXPostMetadata( post );
		if ( !! xPostMetadata.postURL ) {
			if ( this.isPostFullScreen() && xPostMetadata.blogId && xPostMetadata.postId ) {
				this.toggleLikeAction( xPostMetadata.blogId, xPostMetadata.postId );
			}
			return;
		}

		if ( LikeHelper.shouldShowLikes( post ) ) {
			this.toggleLikeAction( post.site_ID, post.ID );
		}
	},

	toggleLikeAction: function( siteId, postId ) {
		const liked = LikeStore.isPostLikedByCurrentUser( siteId, postId );
		if ( liked === null ) {
			// unknown... ignore for now
			return;
		}
		LikeStoreActions[ liked ? 'unlikePost' : 'likePost' ]( siteId, postId );
	},

	isPostFullScreen: function() {
		return !! window.location.pathname.match( /^\/read\/(blogs|feeds)\/([0-9]+)\/posts\/([0-9]+)$/i );
	},

	goToTop: function() {
		if ( this.state.updateCount && this.state.updateCount > 0 ) {
			this.showUpdates();
		} else {
			FeedStreamStoreActions.selectItem( this.props.store.id, 0 );
		}
	},

	getVisibleItemIndexes: function() {
		return this._list && this._list.getVisibleItemIndexes( { offsetTop: HEADER_OFFSET_TOP } );
	},

	selectNextItem: function() {
		var visibleIndexes = this.getVisibleItemIndexes(),
			visibleIndex,
			index,
			i;
		if ( visibleIndexes && visibleIndexes.length > 0 ) {
			index = visibleIndexes[ 0 ].index;
			for ( i = 0; i < visibleIndexes.length; i++ ) {
				visibleIndex = visibleIndexes[ i ];
				if ( visibleIndex.bounds.top > 0 ) {
					index = visibleIndex.index;
					break;
				}
			}
			if ( index === this.state.selectedIndex ) {
				FeedStreamStoreActions.selectNextItem( this.props.store.id, index );
			} else {
				FeedStreamStoreActions.selectItem( this.props.store.id, index );
			}
		}
	},

	selectPrevItem: function() {
		var visibleIndexes = this.getVisibleItemIndexes(),
			visibleIndex,
			index,
			i;
		if ( visibleIndexes && visibleIndexes.length > 0 ) {
			index = visibleIndexes[ 0 ].index;
			for ( i = 0; i < visibleIndexes.length; i++ ) {
				visibleIndex = visibleIndexes[ i ];
				if ( visibleIndex.bounds.top < 0 ) {
					index = visibleIndex.index;
					break;
				}
			}
			if ( index === this.state.selectedIndex ) {
				FeedStreamStoreActions.selectPrevItem( this.props.store.id, index );
			} else {
				FeedStreamStoreActions.selectItem( this.props.store.id, index );
			}
		}
	},

	fetchNextPage: function( options ) {
		if ( this.props.store.isLastPage() || this.props.store.isFetchingNextPage() ) {
			return;
		}
		if ( options.triggeredByScroll ) {
			this.props.trackScrollPage( this.props.store.getPage() + 1 );
		}
		FeedStreamStoreActions.fetchNextPage( this.props.store.id );
	},

	showUpdates: function() {
		this.props.onUpdatesShown();
		FeedStreamStoreActions.showUpdates( this.props.store.id );
		if ( this._list ) {
			this._list.scrollToTop();
		}
	},

	renderLoadingPlaceholders: function() {
		var count = this.state.posts.length ? 2 : this.props.store.getPerPage(),
			placeholders = [];

		times( count, function( i ) {
			placeholders.push( <PostPlaceholder key={ 'feed-post-placeholder-' + i } /> );
		} );

		return placeholders;
	},

	getPostRef: function( postKey ) {
		return 'feed-post-' + ( postKey.feedId || postKey.blogId ) + '-' + postKey.postId;
	},

	showFullXPost: function( xMetadata ) {
		if ( xMetadata.blogId && xMetadata.postId ) {
			const mappedPost = {
				site_ID: xMetadata.blogId,
				ID: xMetadata.postId
			};
			this.showFullPost( mappedPost );
		} else {
			window.open( xMetadata.postURL );
		}
	},

	showFullPost: function( post, options ) {
		options = options || {};
		let hashtag = '';
		if ( options.comments ) {
			hashtag += '#comments';
		}
		const method = options && options.replaceHistory ? 'replace' : 'show';
		if ( post.feed_ID && post.feed_item_ID ) {
			page[ method ]( '/read/feeds/' + post.feed_ID + '/posts/' + post.feed_item_ID + hashtag );
		} else {
			page[ method ]( '/read/blogs/' + post.site_ID + '/posts/' + post.ID + hashtag );
		}
	},

	renderPost: function( postKey, index ) {
		var post,
			postState,
			itemKey,
			content,
			PostClass,
			isSelected = index === this.state.selectedIndex;

		if ( postKey.isGap ) {
			return (
				<ListGap
				ref={ ( c ) => {
					if ( isSelected ) {
						this._selectedGap = c;
					}
				} }
				key={ 'gap-' + postKey.from + '-' + postKey.to }
				gap={ postKey }
				selected={ isSelected }
				store={ this.props.store } />
				);
		}

		post = PostStore.get( postKey );
		postState = post._state;
		itemKey = this.getPostRef( postKey );

		if ( ! post || postState === 'minimal' ) {
			FeedPostStoreActions.fetchPost( postKey );
			postState = 'pending';
		}

		switch ( postState ) {
			case 'pending':
				content = <PostPlaceholder key={ 'feed-post-placeholder-' + itemKey } />;
				break;
			case 'error':
				content = <PostUnavailable key={ 'feed-post-unavailable-' + itemKey } post={ post } />;
				break;
			default:
				PostClass = this.cardClassForPost( post );
				if ( PostClass === CrossPost ) {
					const xMetadata = XPostHelper.getXPostMetadata( post );
					content = React.createElement( CrossPost, {
						ref: itemKey,
						key: itemKey,
						post: post,
						isSelected: isSelected,
						xMetadata: xMetadata,
						xPostedTo: this.props.store.getSitesCrossPostedTo( xMetadata.commentURL || xMetadata.postURL ),
						handleClick: this.showFullXPost
					} );
				} else {
					content = React.createElement( PostClass, {
						ref: itemKey,
						key: itemKey,
						post: post,
						isSelected: isSelected,
						xPostedTo: this.props.store.getSitesCrossPostedTo( post.URL ),
						suppressSiteNameLink: this.props.suppressSiteNameLink,
						showPostHeader: this.props.showPostHeader,
						showFollowInHeader: this.props.showFollowInHeader,
						handleClick: this.showFullPost,
						showPrimaryFollowButtonOnCards: this.props.showPrimaryFollowButtonOnCards
					} );
				}

		}
		return content;
	},

	render: function() {
		var store = this.props.store,
			hasNoPosts = store.isLastPage() && ( ( ! this.state.posts ) || this.state.posts.length === 0 ),
			body, showingStream;

		if ( hasNoPosts || store.hasRecentError( 'invalid_tag' ) ) {
			body = this.props.showEmptyContent ? ( this.props.emptyContent || ( <EmptyContent /> ) ) : null;
			showingStream = false;
		} else {
			body = ( <InfiniteList
			ref={ ( c ) => this._list = c }
			className="reader__content"
			items={ this.state.posts }
			lastPage={ this.props.store.isLastPage() }
			fetchingNextPage={ this.props.store.isFetchingNextPage() }
			guessedItemHeight={ GUESSED_POST_HEIGHT }
			fetchNextPage={ this.fetchNextPage }
			getItemRef= { this.getPostRef }
			renderItem={ this.renderPost }
			selectedIndex={ this.props.store.getSelectedIndex() }
			renderLoadingPlaceholders={ this.renderLoadingPlaceholders } /> );
			showingStream = true;
		}

		return (
			<Main className={ classnames( 'following', this.props.className ) }>
				{ this.props.showMobileBackToSidebar && <MobileBackToSidebar>
					<h1>{ this.props.listName }</h1>
				</MobileBackToSidebar> }

				<UpdateNotice count={ this.state.updateCount } onClick={ this.showUpdates } />
				{ this.props.children }
				{ body }
				{ showingStream && this.props.store.isLastPage() && this.state.posts.length
					? <div className="infinite-scroll-end" />
					: null
				}
			</Main>
		);
	}

} );
