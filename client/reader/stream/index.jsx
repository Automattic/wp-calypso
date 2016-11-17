/**
 * External dependencies
 */
import ReactDom from 'react-dom';
import React from 'react';
import classnames from 'classnames';
import noop from 'lodash/noop';
import times from 'lodash/times';

/**
 * Internal dependencies
 */
import config from 'config';
import ReaderMain from 'components/reader-main';
import Main from 'components/main';
import DISPLAY_TYPES from 'lib/feed-post-store/display-types';
import EmptyContent from './empty';
import FeedStreamStoreActions from 'lib/feed-stream-store/actions';
import FeedPostStoreActions from 'lib/feed-post-store/actions';
import ListGap from 'reader/list-gap';
import LikeStore from 'lib/like-store/like-store';
import LikeStoreActions from 'lib/like-store/actions';
import LikeHelper from 'reader/like-helper';
import InfiniteList from 'components/infinite-list';
import MobileBackToSidebar from 'components/mobile-back-to-sidebar';
import Post from './post';
import CrossPost from './x-post';
import RefreshPost from './refresh-post';
import page from 'page';
import PostUnavailable from './post-unavailable';
import PostPlaceholder from './post-placeholder';
import PostStore from 'lib/feed-post-store';
import UpdateNotice from 'reader/update-notice';
import PostBlocked from './post-blocked';
import KeyboardShortcuts from 'lib/keyboard-shortcuts';
import scrollTo from 'lib/scroll-to';
import XPostHelper from 'reader/xpost-helper';

const GUESSED_POST_HEIGHT = 600;
const HEADER_OFFSET_TOP = 46;

function oldCardFactory( post ) {
	if ( post.display_type & DISPLAY_TYPES.X_POST ) {
		return CrossPost;
	}

	if ( post.is_site_blocked ) {
		return PostBlocked;
	}

	return Post;
}

function refreshCardFactory( post ) {
	let postClass = oldCardFactory( post );
	if ( postClass === Post ) {
		postClass = RefreshPost;
	}
	return postClass;
}

const defaultCardFactory = config.isEnabled( 'reader/refresh/stream' ) ? refreshCardFactory : oldCardFactory;

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
		showDefaultEmptyContentIfMissing: React.PropTypes.bool,
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
			showDefaultEmptyContentIfMissing: true,
			showPrimaryFollowButtonOnCards: true,
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
		return defaultCardFactory( post );
	},

	scrollToSelectedPost: function( animate ) {
		let HEADER_OFFSET = -80, // a fixed position header means we can't just scroll the element into view.
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
		let postKey = this.props.store.getSelectedPost(),
			mappedPost;
		if ( !! postKey ) {
			// gap
			if ( postKey.isGap === true ) {
				return this._selectedGap.handleClick();
			}
			// xpost
			const post = PostStore.get( postKey );
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
		let visibleIndexes = this.getVisibleItemIndexes(),
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
		let visibleIndexes = this.getVisibleItemIndexes(),
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
		let count = this.state.posts.length ? 2 : this.props.store.getPerPage(),
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
		let post,
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
		let store = this.props.store,
			hasNoPosts = store.isLastPage() && ( ( ! this.state.posts ) || this.state.posts.length === 0 ),
			body, showingStream;

		if ( hasNoPosts || store.hasRecentError( 'invalid_tag' ) ) {
			body = this.props.emptyContent;
			if ( ! body && this.props.showDefaultEmptyContentIfMissing ) {
				body = ( <EmptyContent /> );
			}
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
			renderLoadingPlaceholders={ this.renderLoadingPlaceholders } /> );
			showingStream = true;
		}

		const CurrentMain = config.isEnabled( 'reader/refresh/stream' ) ? ReaderMain : Main;

		return (
			<CurrentMain className={ classnames( 'following', this.props.className ) }>
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
			</CurrentMain>
		);
	}

} );
