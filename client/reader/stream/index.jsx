/**
 * External dependencies
 */
import ReactDom from 'react-dom';
import React, { PropTypes } from 'react';
import classnames from 'classnames';
import { defer, findLast, noop, times, clamp, identity, map } from 'lodash';
import { connect } from 'react-redux';

/**
 * Internal dependencies
 */
import ReaderMain from 'components/reader-main';
import EmptyContent from './empty';
import {
	fetchNextPage,
	selectFirstItem,
	selectItem,
	selectNextItem,
	selectPrevItem,
	showUpdates,
	shufflePosts,
} from 'lib/feed-stream-store/actions';
import LikeStore from 'lib/like-store/like-store';
import LikeStoreActions from 'lib/like-store/actions';
import LikeHelper from 'reader/like-helper';
import InfiniteList from 'components/infinite-list';
import MobileBackToSidebar from 'components/mobile-back-to-sidebar';
import PostPlaceholder from './post-placeholder';
import PostStore from 'lib/feed-post-store';
import UpdateNotice from 'reader/update-notice';
import KeyboardShortcuts from 'lib/keyboard-shortcuts';
import scrollTo from 'lib/scroll-to';
import XPostHelper from 'reader/xpost-helper';
import PostLifecycle from './post-lifecycle';
import FeedSubscriptionStore from 'lib/reader-feed-subscriptions';
import { showSelectedPost } from 'reader/utils';
import getBlockedSites from 'state/selectors/get-blocked-sites';
import config from 'config';
import { keysAreEqual } from 'lib/feed-stream-store/post-key';
import { resetCardExpansions } from 'state/ui/reader/card-expansions/actions';
import { combineCards, injectRecommendations, RECS_PER_BLOCK } from './utils';
import { keyToString, keyForPost } from 'lib/feed-stream-store/post-key';

const GUESSED_POST_HEIGHT = 600;
const HEADER_OFFSET_TOP = 46;

const MIN_DISTANCE_BETWEEN_RECS = 4; // page size is 7, so one in the middle of every page and one on page boundries, sometimes
const MAX_DISTANCE_BETWEEN_RECS = 30;

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

class ReaderStream extends React.Component {

	static propTypes = {
		postsStore: PropTypes.object.isRequired,
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
		placeholderFactory: PropTypes.func,
		followSource: PropTypes.string,
		isDiscoverStream: PropTypes.bool,
		shouldCombineCards: PropTypes.bool,
		transformStreamItems: PropTypes.func,
	}

	static defaultProps = {
		showPostHeader: true,
		suppressSiteNameLink: false,
		showFollowInHeader: false,
		onUpdatesShown: noop,
		className: '',
		showDefaultEmptyContentIfMissing: true,
		showPrimaryFollowButtonOnCards: true,
		showMobileBackToSidebar: true,
		isDiscoverStream: false,
		shouldCombineCards: config.isEnabled( 'reader/combined-cards' ),
		transformStreamItems: identity,
	};

	getStateFromStores( store = this.props.postsStore, recommendationsStore = this.props.recommendationsStore ) {
		const posts = map( store.get(), this.props.transformStreamItems );
		const recs = recommendationsStore ? recommendationsStore.get() : null;
		// do we have enough recs? if we have a store, but not enough recs, we should fetch some more...
		if ( recommendationsStore ) {
			if ( ! recs || recs.length < posts.length * ( RECS_PER_BLOCK / getDistanceBetweenRecs() ) ) {
				if ( ! recommendationsStore.isFetchingNextPage() ) {
					defer( () => fetchNextPage( recommendationsStore.id ) );
				}
			}
		}

		let items = this.state && this.state.items;
		if ( ! this.state || posts !== this.state.posts || recs !== this.state.recs ) {
			items = injectRecommendations( posts, recs, getDistanceBetweenRecs() );
		}

		if ( this.props.shouldCombineCards ) {
			items = combineCards( items );
		}

		return {
			items,
			posts,
			recs,
			updateCount: store.getUpdateCount(),
			selectedPostKey: store.getSelectedPostKey(),
			isFetchingNextPage: store.isFetchingNextPage && store.isFetchingNextPage(),
			isLastPage: store.isLastPage()
		};
	}

	state = this.getStateFromStores();

	updateState = ( store ) => {
		this.setState( this.getStateFromStores( store ) );
	}

	componentDidUpdate( prevProps, prevState ) {
		if ( ! keysAreEqual( prevState.selectedPostKey, this.state.selectedPostKey ) ) {
			this.scrollToSelectedPost( true );
			if ( this.isPostFullScreen() ) {
				showSelectedPost( {
					store: this.props.postsStore,
					replaceHistory: true,
				} );
			}
		}
	}

	_popstate = () => {
		if ( this.state.selectedPostKey && history.scrollRestoration !== 'manual' ) {
			this.scrollToSelectedPost( false );
		}
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
		this.props.postsStore.on( 'change', this.updateState );
		this.props.recommendationsStore && this.props.recommendationsStore.on( 'change', this.updateState );
		this.props.resetCardExpansions();

		KeyboardShortcuts.on( 'move-selection-down', this.selectNextItem );
		KeyboardShortcuts.on( 'move-selection-up', this.selectPrevItem );
		KeyboardShortcuts.on( 'open-selection', this.handleOpenSelection );
		KeyboardShortcuts.on( 'like-selection', this.toggleLikeOnSelectedPost );
		KeyboardShortcuts.on( 'go-to-top', this.goToTop );
		window.addEventListener( 'popstate', this._popstate );
		if ( 'scrollRestoration' in history ) {
			history.scrollRestoration = 'manual';
		}
	}

	componentWillUnmount() {
		this.props.postsStore.off( 'change', this.updateState );
		this.props.recommendationsStore && this.props.recommendationsStore.off( 'change', this.updateState );

		KeyboardShortcuts.off( 'move-selection-down', this.selectNextItem );
		KeyboardShortcuts.off( 'move-selection-up', this.selectPrevItem );
		KeyboardShortcuts.off( 'open-selection', this.handleOpenSelection );
		KeyboardShortcuts.off( 'like-selection', this.toggleLikeOnSelectedPost );
		KeyboardShortcuts.off( 'go-to-top', this.goToTop );
		window.removeEventListener( 'popstate', this._popstate );
		if ( 'scrollRestoration' in history ) {
			history.scrollRestoration = 'auto';
		}
	}

	componentWillReceiveProps( nextProps ) {
		if ( nextProps.postsStore !== this.props.postsStore ) {
			this.props.postsStore.off( 'change', this.updateState );
			this.props.recommendationsStore && this.props.recommendationsStore.off( 'change', this.updateState );

			nextProps.postsStore.on( 'change', this.updateState );
			nextProps.recommendationsStore && nextProps.recommendationsStore.on( 'change', this.updateState );
			this.props.resetCardExpansions();

			this.updateState( nextProps.postsStore, nextProps.recommendationsStore );
			this._list && this._list.reset();
		}
	}

	handleOpenSelection = () => {
		const selectedPostKey = this.props.postsStore.getSelectedPostKey();
		showSelectedPost( {
			store: this.props.postsStore,
			postKey: selectedPostKey,
		} );
	}

	toggleLikeOnSelectedPost = () => {
		const postKey = this.props.postsStore.getSelectedPostKey();
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
			selectFirstItem( this.props.postsStore.id );
		}
	}

	getVisibleItemIndexes() {
		return this._list && this._list.getVisibleItemIndexes( { offsetTop: HEADER_OFFSET_TOP } );
	}

	selectNextItem = () => {
		// do we have a selected item? if so, just move to the next one
		if ( this.state.selectedPostKey ) {
			selectNextItem( this.props.postsStore.id );
			return;
		}

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

			const candidateItem = items[ index ];
			// is this a combo card?
			if ( candidateItem.isCombination ) {
				// pick the first item
				const postKey = { postId: candidateItem.postIds[ 0 ] };
				if ( candidateItem.feedId ) {
					postKey.feedId = candidateItem.feedId;
				} else {
					postKey.blogId = candidateItem.blogId;
				}
				selectItem( this.props.postsStore.id, postKey );
			}

			// find the index of the post / gap in the posts array.
			// Start the search from the index in the items array, which has to be equal to or larger than
			// the index in the posts array.
			// Use lastIndexOf to walk the array from right to left
			const selectedPostKey = findLast( posts, items[ index ], index );
			if ( keysAreEqual( selectedPostKey, this.state.selectedPostKey ) ) {
				selectNextItem( this.props.postsStore.id );
			} else {
				selectItem( this.props.postsStore.id, selectedPostKey );
			}
		}
	}

	selectPrevItem = () => {
		// unlike selectNextItem, we don't want any magic here. Just move back an item if the user
		// currently has a selected item. Otherwise do nothing.
		// We avoid the magic here because we expect users to enter the flow using next, not previous.
		if ( this.state.selectedPostKey ) {
			selectPrevItem( this.props.postsStore.id );
		}
	}

	fetchNextPage = ( options ) => {
		if ( this.props.postsStore.isLastPage() || this.props.postsStore.isFetchingNextPage() ) {
			return;
		}
		if ( options.triggeredByScroll ) {
			this.props.trackScrollPage( this.props.postsStore.getPage() + 1 );
		}
		fetchNextPage( this.props.postsStore.id );
	}

	showUpdates = () => {
		this.props.onUpdatesShown();
		showUpdates( this.props.postsStore.id );
		if ( this.props.recommendationsStore ) {
			shufflePosts( this.props.recommendationsStore.id );
		}
		if ( this._list ) {
			this._list.scrollToTop();
		}
	}

	renderLoadingPlaceholders = () => {
		const count = this.state.posts.length ? 2 : this.props.postsStore.getPerPage();

		return times( count, ( i ) => {
			if ( this.props.placeholderFactory ) {
				return this.props.placeholderFactory( { key: 'feed-post-placeholder-' + i } );
			}
			return <PostPlaceholder key={ 'feed-post-placeholder-' + i } />;
		} );
	}

	getPostRef = ( postKey ) => {
		return keyToString( postKey );
	}

	renderPost = ( postKey, index ) => {
		const recStoreId = this.props.recommendationsStore && this.props.recommendationsStore.id;
		const selectedPostKey = this.props.postsStore.getSelectedPostKey();
		const isSelected = !! ( selectedPostKey &&
			selectedPostKey.postId === postKey.postId &&
			(
				selectedPostKey.blogId === postKey.blogId ||
				selectedPostKey.feedId === postKey.feedId
			)
		);

		const itemKey = this.getPostRef( postKey );
		const showPost = ( args ) => showSelectedPost( {
			...args,
			postKey: postKey.isCombination
				? keyForPost( args )
				: postKey,
			store: this.props.postsStore
		} );

		return <PostLifecycle
			key={ itemKey }
			ref={ itemKey }
			isSelected={ isSelected }
			handleClick={ showPost }
			postKey={ postKey }
			store={ this.props.postsStore }
			suppressSiteNameLink={ this.props.suppressSiteNameLink }
			showPostHeader={ this.props.showPostHeader }
			showFollowInHeader={ this.props.showFollowInHeader }
			showPrimaryFollowButtonOnCards={ this.props.showPrimaryFollowButtonOnCards }
			isDiscoverStream={ this.props.isDiscoverStream }
			showSiteName={ this.props.showSiteNameOnCards }
			followSource={ this.props.followSource }
			blockedSites={ this.props.blockedSites }
			index={ index }
			selectedPostKey={ selectedPostKey }
			recStoreId={ recStoreId }
		/>;
	}

	render() {
		const store = this.props.postsStore,
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
				{ showingStream && store.isLastPage() && this.state.posts.length
					? <div className="infinite-scroll-end" />
					: null
				}
			</ReaderMain>
		);
	}
}

export default connect(
	( state ) => ( {
		blockedSites: getBlockedSites( state )
	} ),
	{ resetCardExpansions }
)( ReaderStream );
