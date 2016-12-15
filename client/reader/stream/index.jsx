/**
 * External dependencies
 */
import ReactDom from 'react-dom';
import React, { PropTypes } from 'react';
import classnames from 'classnames';
import { defer, flatMap, lastIndexOf, noop, times, clamp } from 'lodash';

/**
 * Internal dependencies
 */
import ReaderMain from 'components/reader-main';
import DISPLAY_TYPES from 'lib/feed-post-store/display-types';
import EmptyContent from './empty';
import * as FeedStreamStoreActions from 'lib/feed-stream-store/actions';
import ListGap from 'reader/list-gap';
import LikeStore from 'lib/like-store/like-store';
import LikeStoreActions from 'lib/like-store/actions';
import LikeHelper from 'reader/like-helper';
import InfiniteList from 'components/infinite-list';
import MobileBackToSidebar from 'components/mobile-back-to-sidebar';
import CrossPost from './x-post';
import Post from './post';
import page from 'page';
import PostPlaceholder from './post-placeholder';
import PostStore from 'lib/feed-post-store';
import UpdateNotice from 'reader/update-notice';
import PostBlocked from './post-blocked';
import KeyboardShortcuts from 'lib/keyboard-shortcuts';
import scrollTo from 'lib/scroll-to';
import XPostHelper from 'reader/xpost-helper';
import RecommendedPosts from './recommended-posts';
import PostLifecycle from './post-lifecycle';
import FeedSubscriptionStore from 'lib/reader-feed-subscriptions';
import { IN_STREAM_RECOMMENDATION } from 'reader/follow-button/follow-sources';

const GUESSED_POST_HEIGHT = 600;
const HEADER_OFFSET_TOP = 46;

function cardFactory( post ) {
	if ( post.display_type & DISPLAY_TYPES.X_POST ) {
		return CrossPost;
	}

	if ( post.is_site_blocked ) {
		return PostBlocked;
	}

	return Post;
}

const MIN_DISTANCE_BETWEEN_RECS = 4; // page size is 7, so one in the middle of every page and one on page boundries, sometimes
const MAX_DISTANCE_BETWEEN_RECS = 30;
const RECS_PER_BLOCK = 2;

function getDistanceBetweenRecs() {
	// the distance between recs changes based on how many subscriptions the user has.
	// We cap it at MAX_DISTANCE_BETWEEN_RECS.
	// It grows at the natural log of the number of subs, times a multiplier, offset by a constant.
	// This lets the distance between recs grow quickly as you add subs early on, and slow down as you
	// become a common user of the reader.
	const totalSubs = FeedSubscriptionStore.getTotalSubscriptions();
	if ( totalSubs <= 0 ) {
		// 0 means either we don't know yet, or the user actually has zero subs.
		// if a user has zero subs, we don't show posts at all, so just treat 0 as 'unknown' and
		// push recs to the max.
		return MAX_DISTANCE_BETWEEN_RECS;
	}
	const distance = clamp(
		Math.floor( ( Math.log( totalSubs ) * Math.LOG2E * 5 ) - 6 ),
		MIN_DISTANCE_BETWEEN_RECS,
		MAX_DISTANCE_BETWEEN_RECS );
	return distance;
}

function injectRecommendations( posts, recs = [] ) {
	if ( ! recs || recs.length === 0 ) {
		return posts;
	}

	const itemsBetweenRecs = getDistanceBetweenRecs();
	// if we don't have enough posts to insert recs, don't bother
	if ( posts.length < itemsBetweenRecs ) {
		return posts;
	}

	let recIndex = 0;

	return flatMap( posts, ( post, index ) => {
		if ( index && index % itemsBetweenRecs === 0 && recIndex < recs.length ) {
			const recBlock = {
				isRecommendationBlock: true,
				recommendations: recs.slice( recIndex, recIndex + RECS_PER_BLOCK ),
				index: recIndex
			};
			recIndex += RECS_PER_BLOCK;
			return [
				recBlock,
				post
			];
		}
		return post;
	} );
}

export default class ReaderStream extends React.Component {

	static propTypes = {
		store: PropTypes.object.isRequired,
		recommendationsStore: PropTypes.object,
		trackScrollPage: PropTypes.func.isRequired,
		suppressSiteNameLink: PropTypes.bool,
		showPostHeader: PropTypes.bool,
		showFollowInHeader: PropTypes.bool,
		onUpdatesShown: PropTypes.func,
		emptyContent: PropTypes.object,
		className: PropTypes.string,
		showDefaultEmptyContentIfMissing: PropTypes.bool,
		showPrimaryFollowButtonOnCards: PropTypes.bool,
		showMobileBackToSidebar: PropTypes.bool,
		cardFactory: PropTypes.func,
		placeholderFactory: PropTypes.func,
		followSource: PropTypes.string,
	}

	static defaultProps = {
		showPostHeader: true,
		suppressSiteNameLink: false,
		showFollowInHeader: false,
		onUpdatesShown: noop,
		className: '',
		showDefaultEmptyContentIfMissing: true,
		showPrimaryFollowButtonOnCards: true,
		showMobileBackToSidebar: true
	};

	getStateFromStores( store = this.props.store, recommendationsStore = this.props.recommendationsStore ) {
		const posts = store.get();
		const recs = recommendationsStore ? recommendationsStore.get() : null;
		// do we have enough recs? if we have a store, but not enough recs, we should fetch some more...
		if ( recommendationsStore ) {
			if ( ! recs || recs.length < posts.length * ( RECS_PER_BLOCK / getDistanceBetweenRecs() ) ) {
				if ( ! recommendationsStore.isFetchingNextPage() ) {
					defer( () => FeedStreamStoreActions.fetchNextPage( recommendationsStore.id ) );
				}
			}
		}

		let items = this.state && this.state.items;
		if ( ! this.state || posts !== this.state.posts || recs !== this.state.recs ) {
			items = injectRecommendations( posts, recs );
		}
		return {
			items,
			posts,
			recs,
			updateCount: store.getUpdateCount(),
			selectedIndex: store.getSelectedIndex(),
			isFetchingNextPage: store.isFetchingNextPage && store.isFetchingNextPage(),
			isLastPage: store.isLastPage()
		};
	}

	state = this.getStateFromStores();

	updateState = ( store ) => {
		this.setState( this.getStateFromStores( store ) );
	}

	componentDidUpdate( prevProps, prevState ) {
		if ( prevState.selectedIndex !== this.state.selectedIndex ) {
			this.scrollToSelectedPost( true );
			if ( this.isPostFullScreen() ) {
				this.showSelectedPost( { replaceHistory: true } );
			}
		}
	}

	_popstate = () => {
		if ( this.state.selectedIndex > -1 && history.scrollRestoration !== 'manual' ) {
			this.scrollToSelectedPost( false );
		}
	}

	cardClassForPost = ( post ) => {
		if ( this.props.cardFactory ) {
			const externalPostClass = this.props.cardFactory( post );
			if ( externalPostClass ) {
				return externalPostClass;
			}
		}
		return cardFactory( post );
	}

	scrollToSelectedPost( animate ) {
		const HEADER_OFFSET = -80; // a fixed position header means we can't just scroll the element into view.
		const selectedNode = ReactDom.findDOMNode( this ).querySelector( '.is-selected' );
		if ( selectedNode ) {
			const documentElement = document.documentElement;
			selectedNode.focus();
			const windowTop = ( window.pageYOffset || documentElement.scrollTop ) -
				( documentElement.clientTop || 0 );
			const boundingClientRect = selectedNode.getBoundingClientRect();
			const scrollY = parseInt( windowTop + boundingClientRect.top + HEADER_OFFSET, 10 );
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
	}

	componentDidMount() {
		this.props.store.on( 'change', this.updateState );
		this.props.recommendationsStore && this.props.recommendationsStore.on( 'change', this.updateState );

		KeyboardShortcuts.on( 'move-selection-down', this.selectNextItem );
		KeyboardShortcuts.on( 'move-selection-up', this.selectPrevItem );
		KeyboardShortcuts.on( 'open-selection', this.showSelectedPost );
		KeyboardShortcuts.on( 'like-selection', this.toggleLikeOnSelectedPost );
		KeyboardShortcuts.on( 'go-to-top', this.goToTop );
		window.addEventListener( 'popstate', this._popstate );
		if ( 'scrollRestoration' in history ) {
			history.scrollRestoration = 'manual';
		}
	}

	componentWillUnmount() {
		this.props.store.off( 'change', this.updateState );
		this.props.recommendationsStore && this.props.recommendationsStore.off( 'change', this.updateState );

		KeyboardShortcuts.off( 'move-selection-down', this.selectNextItem );
		KeyboardShortcuts.off( 'move-selection-up', this.selectPrevItem );
		KeyboardShortcuts.off( 'open-selection', this.showSelectedPost );
		KeyboardShortcuts.off( 'like-selection', this.toggleLikeOnSelectedPost );
		KeyboardShortcuts.off( 'go-to-top', this.goToTop );
		window.removeEventListener( 'popstate', this._popstate );
		if ( 'scrollRestoration' in history ) {
			history.scrollRestoration = 'auto';
		}
	}

	componentWillReceiveProps( nextProps ) {
		if ( nextProps.store !== this.props.store ) {
			this.props.store.off( 'change', this.updateState );
			this.props.recommendationsStore && this.props.recommendationsStore.off( 'change', this.updateState );

			nextProps.store.on( 'change', this.updateState );
			nextProps.recommendationsStore && nextProps.recommendationsStore.on( 'change', this.updateState );

			this.updateState( nextProps.store, nextProps.recommendationsStore );
			this._list && this._list.reset();
		}
	}

	showSelectedPost = ( options ) => {
		const postKey = this.props.store.getSelectedPost();

		if ( !! postKey ) {
			// gap
			if ( postKey.isGap === true ) {
				return this._selectedGap.handleClick();
			}

			// rec block
			if ( postKey.isRecommendationBlock ) {
				return;
			}

			// xpost
			const post = PostStore.get( postKey );
			if ( this.cardClassForPost( post ) === CrossPost && ! options.replaceHistory ) {
				return this.showFullXPost( XPostHelper.getXPostMetadata( post ) );
			}

			// normal
			let mappedPost;
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
	}

	toggleLikeOnSelectedPost = () => {
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
	}

	toggleLikeAction( siteId, postId ) {
		const liked = LikeStore.isPostLikedByCurrentUser( siteId, postId );
		if ( liked === null ) {
			// unknown... ignore for now
			return;
		}
		LikeStoreActions[ liked ? 'unlikePost' : 'likePost' ]( siteId, postId );
	}

	isPostFullScreen() {
		return !! window.location.pathname.match( /^\/read\/(blogs|feeds)\/([0-9]+)\/posts\/([0-9]+)$/i );
	}

	goToTop = () => {
		if ( this.state.updateCount && this.state.updateCount > 0 ) {
			this.showUpdates();
		} else {
			FeedStreamStoreActions.selectItem( this.props.store.id, 0 );
		}
	}

	getVisibleItemIndexes() {
		return this._list && this._list.getVisibleItemIndexes( { offsetTop: HEADER_OFFSET_TOP } );
	}

	selectNextItem = () => {
		const visibleIndexes = this.getVisibleItemIndexes();
		const { items, posts } = this.state;

		// This is slightly magical...
		// When a user tries to select the "next" item, we really want to select
		// the next item if and only if the currently selected item is at the top of the
		// screen. If the currently selected item is off screen, we'd rather select the item
		// at the top of the screen, rather than the strictly "next" item. This is so a user can
		// pick an item with the keyboard shortcuts, then scroll down a bit, then hit `next` again
		// and have it pick the item at the top of the screen, rather than the item we scrolled past
		if ( visibleIndexes && visibleIndexes.length > 0 ) {
			// default to the first item in the visible list. this item is likely off screen when the user
			// is scrolled down the page
			let index = visibleIndexes[ 0 ].index;

			// walk down the list of "visible" items, looking for the first item whose top extent is on screen
			for ( let i = 0; i < visibleIndexes.length; i++ ) {
				const visibleIndex = visibleIndexes[ i ];
				// skip items whose top are off screen or are recommendation blocks
				if ( visibleIndex.bounds.top > 0 && ! items[ visibleIndex.index ].isRecommendationBlock ) {
					index = visibleIndex.index;
					break;
				}
			}
			// find the index of the post / gap in the posts array.
			// Start the search from the index in the items array, which has to be equal to or larger than
			// the index in the posts array.
			// Use lastIndexOf to walk the array from right to left
			const indexInPosts = lastIndexOf( posts, items[ index ], index );
			if ( indexInPosts === this.state.selectedIndex ) {
				FeedStreamStoreActions.selectNextItem( this.props.store.id );
			} else {
				FeedStreamStoreActions.selectItem( this.props.store.id, indexInPosts );
			}
		}
	}

	selectPrevItem = () => {
		// unlike selectNextItem, we don't want any magic here. Just move back an item if the user
		// currently has a selected item. Otherwise do nothing.
		// We avoid the magic here because we expect users to enter the flow using next, not previous.
		if ( this.state.selectedIndex > 0 ) {
			FeedStreamStoreActions.selectPrevItem( this.props.store.id );
		}
	}

	fetchNextPage = ( options ) => {
		if ( this.props.store.isLastPage() || this.props.store.isFetchingNextPage() ) {
			return;
		}
		if ( options.triggeredByScroll ) {
			this.props.trackScrollPage( this.props.store.getPage() + 1 );
		}
		FeedStreamStoreActions.fetchNextPage( this.props.store.id );
	}

	showUpdates = () => {
		this.props.onUpdatesShown();
		FeedStreamStoreActions.showUpdates( this.props.store.id );
		if ( this.props.recommendationsStore ) {
			FeedStreamStoreActions.shufflePosts( this.props.recommendationsStore.id );
		}
		if ( this._list ) {
			this._list.scrollToTop();
		}
	}

	renderLoadingPlaceholders = () => {
		const count = this.state.posts.length ? 2 : this.props.store.getPerPage();

		return times( count, ( i ) => {
			if ( this.props.placeholderFactory ) {
				return this.props.placeholderFactory( { key: 'feed-post-placeholder-' + i } );
			}
			return <PostPlaceholder key={ 'feed-post-placeholder-' + i } />;
		} );
	}

	getPostRef = ( postKey ) => {
		return 'feed-post-' + ( postKey.feedId || postKey.blogId ) + '-' + postKey.postId;
	}

	showFullXPost = ( xMetadata ) => {
		if ( xMetadata.blogId && xMetadata.postId ) {
			const mappedPost = {
				site_ID: xMetadata.blogId,
				ID: xMetadata.postId
			};
			this.showFullPost( mappedPost );
		} else {
			window.open( xMetadata.postURL );
		}
	}

	showFullPost( post, options = {} ) {
		const hashtag = options.comments ? '#comments' : '';
		let query = '';
		if ( post.referral ) {
			const { blogId, postId } = post.referral;
			query = `?ref_blog=${ blogId }&ref_post=${ postId }`;
		}
		const method = options && options.replaceHistory ? 'replace' : 'show';
		if ( post.feed_ID && post.feed_item_ID ) {
			page[ method ]( `/read/feeds/${ post.feed_ID }/posts/${ post.feed_item_ID }${ hashtag }${ query }` );
		} else {
			page[ method ]( `/read/blogs/${ post.site_ID }/posts/${ post.ID }${ hashtag }${ query }` );
		}
	}

	renderPost = ( postKey, index ) => {
		const selectedPostKey = this.props.store.getSelectedPost();
		const isSelected = !! ( selectedPostKey &&
			selectedPostKey.postId === postKey.postId &&
			(
				selectedPostKey.blogId === postKey.blogId ||
				selectedPostKey.feedId === postKey.feedId
			)
		);

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

		if ( postKey.isRecommendationBlock ) {
			return <RecommendedPosts
				recommendations={ postKey.recommendations }
				index={ postKey.index }
				storeId={ this.props.recommendationsStore.id }
				key={ `recs-${ index }` }
				followSource={ IN_STREAM_RECOMMENDATION }
				/>;
		}

		const itemKey = this.getPostRef( postKey );

		return <PostLifecycle
			key={ itemKey }
			ref={ itemKey }
			isSelected={ isSelected }
			handleXPostClick={ this.showFullXPost }
			handleClick={ this.showFullPost }
			postKey={ postKey }
			store={ this.props.store }
			suppressSiteNameLink={ this.props.suppressSiteNameLink }
			showPostHeader={ this.props.showPostHeader }
			showFollowInHeader={ this.props.showFollowInHeader }
			showPrimaryFollowButtonOnCards={ this.props.showPrimaryFollowButtonOnCards }
			showSiteName={ this.props.showSiteNameOnCards }
			cardClassForPost={ this.cardClassForPost }
			followSource={ this.props.followSource }
		/>;
	}

	render() {
		const store = this.props.store,
			hasNoPosts = store.isLastPage() && ( ( ! this.state.posts ) || this.state.posts.length === 0 );
		let body, showingStream;

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
			items={ this.state.items }
			lastPage={ this.state.isLastPage }
			fetchingNextPage={ this.state.isFetchingNextPage }
			guessedItemHeight={ GUESSED_POST_HEIGHT }
			fetchNextPage={ this.fetchNextPage }
			getItemRef= { this.getPostRef }
			renderItem={ this.renderPost }
			renderLoadingPlaceholders={ this.renderLoadingPlaceholders } /> );
			showingStream = true;
		}

		return (
			<ReaderMain className={ classnames( 'following', this.props.className ) }>
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
			</ReaderMain>
		);
	}
}
