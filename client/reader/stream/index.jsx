/**
 * External dependencies
 */
import ReactDom from 'react-dom';
import PropTypes from 'prop-types';
import React from 'react';
import classnames from 'classnames';
import { findLast, noop, times } from 'lodash';
import { connect } from 'react-redux';
import { localize } from 'i18n-calypso';

/**
 * Internal dependencies
 */
import ReaderMain from 'calypso/reader/components/reader-main';
import EmptyContent from './empty';
import {
	requestPage,
	selectItem,
	selectNextItem,
	selectPrevItem,
	showUpdates,
} from 'calypso/state/reader/streams/actions';
import {
	getStream,
	getTransformedStreamItems,
	shouldRequestRecs,
} from 'calypso/state/reader/streams/selectors';

import { shouldShowLikes } from 'calypso/reader/like-helper';
import { like as likePost, unlike as unlikePost } from 'calypso/state/posts/likes/actions';
import { isLikedPost } from 'calypso/state/posts/selectors/is-liked-post';
import ListEnd from 'calypso/components/list-end';
import InfiniteList from 'calypso/components/infinite-list';
import MobileBackToSidebar from 'calypso/components/mobile-back-to-sidebar';
import PostPlaceholder from './post-placeholder';
import UpdateNotice from 'calypso/reader/update-notice';
import KeyboardShortcuts from 'calypso/lib/keyboard-shortcuts';
import scrollTo from 'calypso/lib/scroll-to';
import XPostHelper from 'calypso/reader/xpost-helper';
import PostLifecycle from './post-lifecycle';
import { showSelectedPost, getStreamType } from 'calypso/reader/utils';
import { getBlockedSites } from 'calypso/state/reader/site-blocks/selectors';
import { keysAreEqual, keyToString, keyForPost } from 'calypso/reader/post-key';
import { resetCardExpansions } from 'calypso/state/reader-ui/card-expansions/actions';
import { reduxGetState } from 'calypso/lib/redux-bridge';
import { getPostByKey } from 'calypso/state/reader/posts/selectors';
import { viewStream } from 'calypso/state/reader/watermarks/actions';
import { Interval, EVERY_MINUTE } from 'calypso/lib/interval';
import { PER_FETCH, INITIAL_FETCH } from 'calypso/state/data-layer/wpcom/read/streams';
import { PerformanceTrackerStop } from 'calypso/lib/performance-tracking';

/**
 * Style dependencies
 */
import './style.scss';

const GUESSED_POST_HEIGHT = 600;
const HEADER_OFFSET_TOP = 46;

const pagesByKey = new Map();

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

	listRef = React.createRef();

	componentDidUpdate( { selectedPostKey, streamKey } ) {
		if ( streamKey !== this.props.streamKey ) {
			this.props.resetCardExpansions();
			this.props.viewStream( { streamKey, path: window.location.pathname } );
			this.fetchNextPage( {} );
		}

		if ( ! keysAreEqual( selectedPostKey, this.props.selectedPostKey ) ) {
			this.scrollToSelectedPost( true );
		}

		if ( this.props.shouldRequestRecs ) {
			this.props.requestPage( {
				streamKey: this.props.recsStreamKey,
				pageHandle: this.props.recsStream.pageHandle,
			} );
		}
	}

	_popstate = () => {
		if ( this.props.selectedPostKey && window.history.scrollRestoration !== 'manual' ) {
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
		this.props.viewStream( { streamKey, path: window.location.pathname } );
		this.fetchNextPage( {} );

		KeyboardShortcuts.on( 'move-selection-down', this.selectNextItem );
		KeyboardShortcuts.on( 'move-selection-up', this.selectPrevItem );
		KeyboardShortcuts.on( 'open-selection', this.handleOpenSelection );
		KeyboardShortcuts.on( 'open-selection-new-tab', this.handleOpenSelectionNewTab );
		KeyboardShortcuts.on( 'like-selection', this.toggleLikeOnSelectedPost );
		KeyboardShortcuts.on( 'go-to-top', this.goToTop );
		window.addEventListener( 'popstate', this._popstate );
		if ( 'scrollRestoration' in window.history ) {
			window.history.scrollRestoration = 'manual';
		}
	}

	componentWillUnmount() {
		KeyboardShortcuts.off( 'move-selection-down', this.selectNextItem );
		KeyboardShortcuts.off( 'move-selection-up', this.selectPrevItem );
		KeyboardShortcuts.off( 'open-selection', this.handleOpenSelection );
		KeyboardShortcuts.off( 'open-selection-new-tab', this.handleOpenSelectionNewTab );
		KeyboardShortcuts.off( 'like-selection', this.toggleLikeOnSelectedPost );
		KeyboardShortcuts.off( 'go-to-top', this.goToTop );
		window.removeEventListener( 'popstate', this._popstate );
		if ( 'scrollRestoration' in window.history ) {
			window.history.scrollRestoration = 'auto';
		}
	}

	handleOpenSelectionNewTab = () => {
		window.open( this.props.selectedPostKey.url, '_blank', 'noreferrer,noopener' );
	};

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
		if ( xPostMetadata.postURL ) {
			return;
		}

		if ( shouldShowLikes( post ) ) {
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
		return (
			this.listRef.current &&
			this.listRef.current.getVisibleItemIndexes( { offsetTop: HEADER_OFFSET_TOP } )
		);
	}

	selectNextItem = () => {
		// note that we grab the items directly from the stream because we don't want the transformed
		// one with combined cards
		const {
			streamKey,
			stream: { items },
		} = this.props;

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
		const {
			streamKey,
			selectedPostKey,
			stream: { items },
		} = this.props;
		// unlike selectNextItem, we don't want any magic here. Just move back an item if the user
		// currently has a selected item. Otherwise do nothing.
		// We avoid the magic here because we expect users to enter the flow using next, not previous.
		if ( selectedPostKey ) {
			this.props.selectPrevItem( { streamKey, items } );
		}
	};

	poll = () => {
		const { streamKey } = this.props;
		this.props.requestPage( { streamKey, isPoll: true } );
	};

	fetchNextPage = ( options, props = this.props ) => {
		const { streamKey, stream, startDate } = props;
		if ( options.triggeredByScroll ) {
			const page = pagesByKey.get( streamKey ) || 0;
			pagesByKey.set( streamKey, page + 1 );

			props.trackScrollPage( page );
		}
		const pageHandle = stream.pageHandle || { before: startDate };
		props.requestPage( { streamKey, pageHandle } );
	};

	showUpdates = () => {
		const { streamKey } = this.props;
		this.props.onUpdatesShown();
		this.props.showUpdates( { streamKey } );
		// @todo: do we need to shuffle?
		// if ( this.props.recommendationsStore ) {
		// 	shufflePosts( this.props.recommendationsStore.id );
		// }
		if ( this.listRef.current ) {
			this.listRef.current.scrollToTop();
		}
	};

	renderLoadingPlaceholders = () => {
		const { items } = this.props;
		const count = items.length === 0 ? INITIAL_FETCH : PER_FETCH;

		return times( count, ( i ) => {
			if ( this.props.placeholderFactory ) {
				return this.props.placeholderFactory( { key: 'feed-post-placeholder-' + i } );
			}
			return <PostPlaceholder key={ 'feed-post-placeholder-' + i } />;
		} );
	};

	getPostRef = ( postKey ) => {
		return keyToString( postKey );
	};

	renderPost = ( postKey, index ) => {
		const { selectedPostKey, streamKey } = this.props;
		const isSelected = !! ( selectedPostKey && keysAreEqual( selectedPostKey, postKey ) );

		const itemKey = this.getPostRef( postKey );
		const showPost = ( args ) =>
			showSelectedPost( {
				...args,
				postKey: postKey.isCombination ? keyForPost( args ) : postKey,
				streamKey,
			} );

		return (
			<React.Fragment key={ itemKey }>
				<PostLifecycle
					ref={ itemKey /* The ref is stored into `InfiniteList`'s `this.ref` map */ }
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
				{ index === 0 && <PerformanceTrackerStop /> }
			</React.Fragment>
		);
	};

	render() {
		const { forcePlaceholders, lastPage, streamKey } = this.props;
		let { items, isRequesting } = this.props;

		const hasNoPosts = items.length === 0 && ! isRequesting;
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
			/* eslint-disable wpcalypso/jsx-classname-namespace */
			body = (
				<InfiniteList
					ref={ this.listRef }
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
			/* eslint-enable wpcalypso/jsx-classname-namespace */
		}
		const streamType = getStreamType( streamKey );
		const shouldPoll = streamType !== 'search' && streamType !== 'custom_recs_posts_with_images';

		const TopLevel = this.props.isMain ? ReaderMain : 'div';
		return (
			<TopLevel className={ classnames( 'following', this.props.className ) }>
				{ shouldPoll && <Interval onTick={ this.poll } period={ EVERY_MINUTE } /> }
				{ this.props.isMain && this.props.showMobileBackToSidebar && (
					<MobileBackToSidebar>
						<h1>{ this.props.translate( 'Streams' ) }</h1>
					</MobileBackToSidebar>
				) }

				<UpdateNotice streamKey={ streamKey } onClick={ this.showUpdates } />
				{ this.props.children }
				{ showingStream && items.length ? this.props.intro : null }
				{ body }
				{ showingStream && items.length && ! isRequesting ? <ListEnd /> : null }
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
	}
)( localize( ReaderStream ) );
