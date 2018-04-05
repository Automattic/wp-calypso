/** @format */
/**
 * External dependencies
 */
import ReactDom from 'react-dom';
import PropTypes from 'prop-types';
import React from 'react';
import classnames from 'classnames';
import { includes, findLast, noop, times } from 'lodash';
import { connect } from 'react-redux';
import { localize } from 'i18n-calypso';

/**
 * Internal dependencies
 */
import ReaderMain from 'components/reader-main';
import EmptyContent from './empty';
import {
	requestPage,
	selectItem,
	selectNextItem,
	selectPrevItem,
	showUpdates,
	// shufflePosts,
} from 'state/reader/streams/actions';
import {
	getReaderStream as getStream,
	getReaderStreamTransformedItems as getTransformedStreamItems,
	getReaderStreamShouldRequestRecommendations as shouldRequestRecs,
} from 'state/selectors';

import LikeHelper from 'reader/like-helper';
import { like as likePost, unlike as unlikePost } from 'state/posts/likes/actions';
import isLikedPost from 'state/selectors/is-liked-post';
import ListEnd from 'components/list-end';
import InfiniteList from 'components/infinite-list';
import MobileBackToSidebar from 'components/mobile-back-to-sidebar';
import PostPlaceholder from './post-placeholder';
import UpdateNotice from 'reader/update-notice';
import KeyboardShortcuts from 'lib/keyboard-shortcuts';
import scrollTo from 'lib/scroll-to';
import XPostHelper from 'reader/xpost-helper';
import PostLifecycle from './post-lifecycle';
import { showSelectedPost } from 'reader/utils';
import getBlockedSites from 'state/selectors/get-blocked-sites';
import { keysAreEqual, keyToString, keyForPost } from 'reader/post-key';
import { resetCardExpansions } from 'state/ui/reader/card-expansions/actions';
import { reduxGetState } from 'lib/redux-bridge';
import { getPostByKey } from 'state/reader/posts/selectors';
import { viewStream } from 'state/reader/watermarks/actions';

const GUESSED_POST_HEIGHT = 600;
const HEADER_OFFSET_TOP = 46;

class ReaderStream extends React.Component {
	static propTypes = {
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
		useCompactCards: PropTypes.bool,
		isMain: PropTypes.bool,
		intro: PropTypes.object,
		forcePlaceholders: PropTypes.bool,
		recsStreamKey: PropTypes.string,
	};

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
		shouldCombineCards: true,
		isMain: true,
		useCompactCards: false,
		intro: null,
		forcePlaceholders: false,
	};

	componentDidUpdate( { selectedPostKey } ) {
		if ( ! keysAreEqual( selectedPostKey, this.props.selectedPostKey ) ) {
			this.scrollToSelectedPost( true );
		}
		if ( this.props.shouldRequestRecs ) {
			this.props.requestPage( {
				streamKey: this.props.recsStreamKey,
				pageHandle: { offset: this.props.recsStream.items.length }, // @todo: move setting of pageHandle to data-layer
			} );
		}
	}

	_popstate = () => {
		if ( this.props.selectedPostKey && history.scrollRestoration !== 'manual' ) {
			this.scrollToSelectedPost( false );
		}
	};

	scrollToSelectedPost( animate ) {
		const HEADER_OFFSET = -80; // a fixed position header means we can't just scroll the element into view.
		const selectedNode = ReactDom.findDOMNode( this ).querySelector( '.is-selected' );
		if ( selectedNode ) {
			const documentElement = document.documentElement;
			selectedNode.focus();
			const windowTop =
				( window.pageYOffset || documentElement.scrollTop ) - ( documentElement.clientTop || 0 );
			const boundingClientRect = selectedNode.getBoundingClientRect();
			const scrollY = parseInt( windowTop + boundingClientRect.top + HEADER_OFFSET, 10 );
			if ( animate ) {
				scrollTo( {
					x: 0,
					y: scrollY,
					duration: 200,
				} );
			} else {
				window.scrollTo( 0, scrollY );
			}
		}
	}

	componentDidMount() {
		const { streamKey } = this.props;
		this.props.resetCardExpansions();
		this.props.viewStream( { streamKey } );

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
		const { streamKey } = nextProps;
		if ( streamKey !== this.props.streamKey ) {
			this.props.resetCardExpansions();
			this.props.viewStream( { streamKey } );
		}
	}

	handleOpenSelection = () => {
		showSelectedPost( {
			store: this.props.streamKey,
			postKey: this.props.selectedPostKey,
		} );
	};

	toggleLikeOnSelectedPost = () => {
		const { selectedPost: post } = this.props;

		// only toggle a like on a x-post if we have the appropriate metadata,
		// and original post is full screen
		const xPostMetadata = XPostHelper.getXPostMetadata( post );
		if ( !! xPostMetadata.postURL ) {
			return;
		}

		if ( LikeHelper.shouldShowLikes( post ) ) {
			this.toggleLikeAction( post.site_ID, post.ID );
		}
	};

	toggleLikeAction( siteId, postId ) {
		const liked = isLikedPost( reduxGetState(), siteId, postId );
		if ( liked === null ) {
			// unknown... ignore for now
			return;
		}

		const toggler = liked ? this.props.unlikePost : this.props.likePost;
		toggler( siteId, postId, { source: 'reader' } );
	}

	goToTop = () => {
		const { streamKey, updateCount } = this.props;
		if ( updateCount > 0 ) {
			this.props.showUpdates( { streamKey } );
		} else {
			this.props.selectFirstItem( { streamKey } );
		}
	};

	getVisibleItemIndexes() {
		return this._list && this._list.getVisibleItemIndexes( { offsetTop: HEADER_OFFSET_TOP } );
	}

	selectNextItem = () => {
		// note that we grab the items directly from the stream because we don't want the transformed
		// one with combined cards
		const { streamKey, stream: { items } } = this.props;

		// do we have a selected item? if so, just move to the next one
		if ( this.props.selectedPostKey ) {
			this.props.selectNextItem( { streamKey, items } );
			return;
		}

		const visibleIndexes = this.getVisibleItemIndexes();

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
				const postKey = {
					postId: candidateItem.postIds[ 0 ],
					feedId: candidateItem.feedId,
					blogId: candidateItem.blogId,
				};
				this.props.selectItem( { streamKey, postKey } );
			}

			// find the index of the post / gap in the items array.
			// Start the search from the index in the items array, which has to be equal to or larger than
			// the index in the items array.
			// Use lastIndexOf to walk the array from right to left
			const selectedPostKey = findLast( items, items[ index ], index );
			if ( keysAreEqual( selectedPostKey, this.props.selectedPostKey ) ) {
				this.props.selectNextItem( { streamKey, items } );
			} else {
				this.props.selectItem( { streamKey, postKey: selectedPostKey } );
			}
		}
	};

	selectPrevItem = () => {
		// note that we grab the items directly from the stream because we don't want the transformed
		// one with combined cards
		const { streamKey, selectedPostKey, stream: { items } } = this.props;
		// unlike selectNextItem, we don't want any magic here. Just move back an item if the user
		// currently has a selected item. Otherwise do nothing.
		// We avoid the magic here because we expect users to enter the flow using next, not previous.
		if ( selectedPostKey ) {
			this.props.selectPrevItem( { streamKey, items } );
		}
	};

	fetchNextPage = options => {
		const { streamKey, stream } = this.props;
		if ( options.triggeredByScroll ) {
			// this.props.trackScrollPage( this.props.postsStore.getPage() + 1 );
		}

		const pageHandle = includes( streamKey, 'rec' ) // recs api requires offsets
			? { offset: stream.items.length }
			: stream.pageHandle;
		this.props.requestPage( { streamKey, pageHandle } );
	};

	showUpdates = () => {
		const { streamKey } = this.props;
		this.props.onUpdatesShown();
		this.props.showUpdates( { streamKey } );
		// if ( this.props.recommendationsStore ) {
		// 	shufflePosts( this.props.recommendationsStore.id );
		// }
		// if ( this._list ) {
		// 	this._list.scrollToTop();
		// }
	};

	renderLoadingPlaceholders = () => {
		const { items } = this.props;
		const count = items.length === 0 ? 2 : 4; // @TODO: figure out what numbers should go here and make sensible const

		return times( count, i => {
			if ( this.props.placeholderFactory ) {
				return this.props.placeholderFactory( { key: 'feed-post-placeholder-' + i } );
			}
			return <PostPlaceholder key={ 'feed-post-placeholder-' + i } />;
		} );
	};

	getPostRef = postKey => {
		return keyToString( postKey );
	};

	renderPost = ( postKey, index ) => {
		const { selectedPostKey, streamKey } = this.props;
		const isSelected = !! ( selectedPostKey && keysAreEqual( selectedPostKey, postKey ) );

		const itemKey = this.getPostRef( postKey );
		const showPost = args =>
			showSelectedPost( {
				...args,
				postKey: postKey.isCombination ? keyForPost( args ) : postKey,
				streamKey,
			} );

		return (
			<PostLifecycle
				key={ itemKey }
				ref={ itemKey }
				isSelected={ isSelected }
				handleClick={ showPost }
				postKey={ postKey }
				suppressSiteNameLink={ this.props.suppressSiteNameLink }
				showPostHeader={ this.props.showPostHeader }
				showFollowInHeader={ this.props.showFollowInHeader }
				showPrimaryFollowButtonOnCards={ this.props.showPrimaryFollowButtonOnCards }
				isDiscoverStream={ this.props.isDiscoverStream }
				showSiteName={ this.props.showSiteNameOnCards }
				selectedPostKey={ postKey.isCombination ? selectedPostKey : undefined }
				followSource={ this.props.followSource }
				blockedSites={ this.props.blockedSites }
				streamKey={ streamKey }
				recsStreamKey={ this.props.recsStreamKey }
				index={ index }
				compact={ this.props.useCompactCards }
			/>
		);
	};

	render() {
		const { forcePlaceholders, pendingItems, updateCount, lastPage } = this.props;
		let { items, isRequesting } = this.props;

		const hasNoPosts = false && items.length === 0;
		let body, showingStream;

		// trick an infinite list to showing placeholders
		if ( forcePlaceholders ) {
			items = [];
			isRequesting = true;
		}

		// @TODO: has error of invalid tag?
		if ( hasNoPosts ) {
			body = this.props.emptyContent;
			if ( ! body && this.props.showDefaultEmptyContentIfMissing ) {
				body = <EmptyContent />;
			}
			showingStream = false;
		} else {
			body = (
				<InfiniteList
					ref={ c => ( this._list = c ) }
					className="reader__content"
					items={ items }
					lastPage={ lastPage }
					fetchingNextPage={ isRequesting }
					guessedItemHeight={ GUESSED_POST_HEIGHT }
					fetchNextPage={ this.fetchNextPage }
					getItemRef={ this.getPostRef }
					renderItem={ this.renderPost }
					renderLoadingPlaceholders={ this.renderLoadingPlaceholders }
				/>
			);
			showingStream = true;
		}
		const TopLevel = this.props.isMain ? ReaderMain : 'div';
		return (
			<TopLevel className={ classnames( 'following', this.props.className ) }>
				{ this.props.isMain &&
					this.props.showMobileBackToSidebar && (
						<MobileBackToSidebar>
							<h1>{ this.props.translate( 'Streams' ) }</h1>
						</MobileBackToSidebar>
					) }

				<UpdateNotice
					count={ updateCount }
					onClick={ this.props.showUpdates }
					pendingPostKeys={ pendingItems }
				/>
				{ this.props.children }
				{ showingStream && items.length ? this.props.intro : null }
				{ body }
				{ showingStream && false /*TODO: make work */ && items.length && <ListEnd /> }
			</TopLevel>
		);
	}
}

export default connect(
	( state, { streamKey, recsStreamKey, shouldCombineCards = true } ) => {
		const stream = getStream( state, streamKey );

		return {
			blockedSites: getBlockedSites( state ),
			items: getTransformedStreamItems( state, {
				streamKey,
				recsStreamKey,
				shouldCombine: shouldCombineCards,
			} ),
			stream,
			recsStream: getStream( state, recsStreamKey ),
			pendingItems: stream.pendingItems,
			updateCount: stream.pendingItems.length,
			selectedPostKey: stream.selected,
			selectedPost: getPostByKey( state, stream.selected ),
			lastPage: stream.lastPage,
			isRequesting: stream.isRequesting,
			shouldRequestRecs: shouldRequestRecs( state, streamKey, recsStreamKey ),
		};
	},
	{
		resetCardExpansions,
		likePost,
		unlikePost,
		requestPage,
		selectItem,
		selectNextItem,
		selectPrevItem,
		showUpdates,
		viewStream,
		// shufflePosts,
	}
)( localize( ReaderStream ) );
