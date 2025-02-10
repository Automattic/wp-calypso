import { isDefaultLocale } from '@automattic/i18n-utils';
import clsx from 'clsx';
import { localize } from 'i18n-calypso';
import { findLast, times } from 'lodash';
import PropTypes from 'prop-types';
import { createRef, Component, Fragment } from 'react';
import * as React from 'react';
import ReactDom from 'react-dom';
import { connect } from 'react-redux';
import AppPromo from 'calypso/blocks/app-promo';
import InfiniteList from 'calypso/components/infinite-list';
import ListEnd from 'calypso/components/list-end';
import SectionNav from 'calypso/components/section-nav';
import NavItem from 'calypso/components/section-nav/item';
import NavTabs from 'calypso/components/section-nav/tabs';
import { Interval, EVERY_MINUTE } from 'calypso/lib/interval';
import scrollTo from 'calypso/lib/scroll-to';
import withDimensions from 'calypso/lib/with-dimensions';
import ReaderMain from 'calypso/reader/components/reader-main';
import { shouldShowLikes } from 'calypso/reader/like-helper';
import { keysAreEqual, keyToString } from 'calypso/reader/post-key';
import UpdateNotice from 'calypso/reader/update-notice';
import { showSelectedPost, getStreamType } from 'calypso/reader/utils';
import XPostHelper from 'calypso/reader/xpost-helper';
import { PER_FETCH, INITIAL_FETCH } from 'calypso/state/data-layer/wpcom/read/streams';
import { like as likePost, unlike as unlikePost } from 'calypso/state/posts/likes/actions';
import { isLikedPost } from 'calypso/state/posts/selectors/is-liked-post';
import { getReaderOrganizations } from 'calypso/state/reader/organizations/selectors';
import { getPostByKey } from 'calypso/state/reader/posts/selectors';
import { getBlockedSites } from 'calypso/state/reader/site-blocks/selectors';
import {
	clearStream,
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
import { viewStream } from 'calypso/state/reader-ui/actions';
import { resetCardExpansions } from 'calypso/state/reader-ui/card-expansions/actions';
import { getSelectedFeedId } from 'calypso/state/reader-ui/sidebar/selectors';
import getCurrentLocaleSlug from 'calypso/state/selectors/get-current-locale-slug';
import getPrimarySiteId from 'calypso/state/selectors/get-primary-site-id';
import isNotificationsOpen from 'calypso/state/selectors/is-notifications-open';
import { ReaderPerformanceTrackerStop } from '../reader-performance-tracker';
import { CustomerCouncilBanner } from './customer-council-banner';
import EmptyContent from './empty';
import PostLifecycle from './post-lifecycle';
import PostPlaceholder from './post-placeholder';
import './style.scss';

// minimal size for the two-column layout to show without cut off
// 64 is padding, 8 is margin
export const WIDE_DISPLAY_CUTOFF = 950 + 64 * 2 + 8 * 2;
const GUESSED_POST_HEIGHT = 600;
const noop = () => {};
const pagesByKey = new Map();
const inputTags = [ 'INPUT', 'SELECT', 'TEXTAREA' ];

class ReaderStream extends Component {
	static propTypes = {
		className: PropTypes.string,
		emptyContent: PropTypes.func,
		followSource: PropTypes.string,
		forcePlaceholders: PropTypes.bool,
		intro: PropTypes.func,
		isDiscoverStream: PropTypes.bool,
		isMain: PropTypes.bool,
		onUpdatesShown: PropTypes.func,
		placeholderFactory: PropTypes.func,
		recsStreamKey: PropTypes.string,
		showDefaultEmptyContentIfMissing: PropTypes.bool,
		showFollowButton: PropTypes.bool,
		showFollowInHeader: PropTypes.bool,
		sidebarTabTitle: PropTypes.string,
		streamHeader: PropTypes.func,
		streamSidebar: PropTypes.func,
		suppressSiteNameLink: PropTypes.bool,
		trackScrollPage: PropTypes.func.isRequired,
		translate: PropTypes.func,
		useCompactCards: PropTypes.bool,
		fixedHeaderHeight: PropTypes.number,
		selectedStreamName: PropTypes.string,
	};

	static defaultProps = {
		className: '',
		forcePlaceholders: false,
		intro: null,
		isDiscoverStream: false,
		isMain: true,
		onUpdatesShown: noop,
		showDefaultEmptyContentIfMissing: true,
		showFollowButton: true,
		showFollowInHeader: false,
		suppressSiteNameLink: false,
		useCompactCards: false,
	};

	state = {
		selectedTab: 'posts',
	};

	isMounted = false;

	/**
	 * A mutation observer to watch whether the target exists
	 */
	observer = null;

	// We can use to keep track of whether we need to scroll to the selected post in the update
	// cycle.
	wasSelectedByOpeningPost = false;

	listRef = createRef();
	overlayRef = createRef();
	mountTimeout = null;

	handlePostsSelected = () => {
		this.setState( { selectedTab: 'posts' } );
	};
	handleSitesSelected = () => {
		this.setState( { selectedTab: 'sites' } );
	};

	componentDidUpdate( { selectedPostKey, streamKey, selectedFeedId } ) {
		// Fetch new page if selected feed or stream is changed.
		if ( selectedFeedId !== this.props.selectedFeedId ) {
			this.scrollFeedListToTop();
			this.props.clearStream( { streamKey } );
			this.fetchNextPage( {}, { ...this.props, stream: null } ); // Stream as null to start fresh pagination.
		} else if ( streamKey !== this.props.streamKey ) {
			this.props.resetCardExpansions();
			this.props.viewStream( streamKey, window.location.pathname );
			this.fetchNextPage( {} );
		}

		if ( ! keysAreEqual( selectedPostKey, this.props.selectedPostKey ) ) {
			// Don't scroll to the post if it was clicked for selection. This causes the scroll to
			// propagate into the full post screen the first time you click select an item in the
			// reader, meaning the full post screen opens halfway scrolled down the post.
			if ( ! this.wasSelectedByOpeningPost ) {
				this.scrollToSelectedPost( true );
			}
			this.wasSelectedByOpeningPost = false;
			this.focusSelectedPost( this.props.selectedPostKey );
		}

		if ( this.props.shouldRequestRecs ) {
			this.props.requestPage( {
				streamKey: this.props.recsStreamKey,
				feedId: this.props.selectedFeedId,
				pageHandle: this.props.recsStream.pageHandle,
				localeSlug: this.props.localeSlug,
			} );
		}
	}

	focusSelectedPost = ( selectedPostKey ) => {
		const postRefKey = this.getPostRef( selectedPostKey );
		const ref = this.listRef.current && this.listRef.current.refs[ postRefKey ];
		const node = ReactDom.findDOMNode( ref );

		// if the post is found, focus the first anchor tag within it.
		if ( node ) {
			const firstLink = node.querySelector( 'a' );

			if ( firstLink ) {
				firstLink.focus();
			}
		}
	};

	_popstate = () => {
		if ( this.props.selectedPostKey && window.history.scrollRestoration !== 'manual' ) {
			this.scrollToSelectedPost( false );
		}
	};

	scrollToSelectedPost( animate ) {
		const scrollContainer = this.state.listContext || window;
		const containerOffset = scrollContainer.getBoundingClientRect?.().top || 0;
		const headerOffset = -1 * this.props.fixedHeaderHeight || 0; // a fixed position header means we can't just scroll the element into view.
		const totalOffset = headerOffset - containerOffset - 20; // 20px of constant offset to ensure the post isnt cramped against the top container or header border.
		const selectedNode = ReactDom.findDOMNode( this ).querySelector( '.card.is-selected' );
		if ( selectedNode ) {
			selectedNode.focus();
			const scrollContainerPosition = scrollContainer.scrollTop;
			const boundingClientRect = selectedNode.getBoundingClientRect();
			const scrollY = parseInt(
				scrollContainerPosition + boundingClientRect.top + totalOffset,
				10
			);
			if ( animate ) {
				scrollTo( {
					x: 0,
					y: scrollY,
					duration: 200,
					container: scrollContainer,
				} );
			} else {
				scrollContainer.scrollTo( 0, scrollY );
			}
		}
	}

	componentDidMount() {
		const { streamKey } = this.props;
		this.props.resetCardExpansions();
		this.props.viewStream( streamKey, window.location.pathname );
		this.fetchNextPage( {} );
		this.isMounted = true;

		window.addEventListener( 'popstate', this._popstate );
		if ( 'scrollRestoration' in window.history ) {
			window.history.scrollRestoration = 'manual';
		}

		if ( this.props.selectedPostKey ) {
			// Show an overlay while we are handling initial scroll and focus to prevent flashing
			// content.
			if ( this.overlayRef.current ) {
				this.overlayRef.current.classList.add( 'stream__init-overlay-enabled' );
			}
			this.mountTimeout = setTimeout( () => {
				this.scrollToSelectedPost( false );
				this.focusSelectedPost( this.props.selectedPostKey );
				if ( this.overlayRef.current ) {
					this.overlayRef.current.classList.remove( 'stream__init-overlay-enabled' );
				}
			}, 100 );
		}

		document.addEventListener( 'keydown', this.handleKeydown, true );

		/**
		 * Observe the class list of the body element because the scroll container depends on it.
		 */
		this.observer = new window.MutationObserver( () => {
			if ( ! this.listRef.current ) {
				return;
			}

			const scrollContainer = this.getScrollContainer(
				ReactDom.findDOMNode( this.listRef.current )
			);
			if ( scrollContainer !== this.state.listContext ) {
				this.setState( {
					listContext: scrollContainer,
				} );
			}
		} );
		this.observer.observe( document.body, { attributeFilter: [ 'class' ] } );
	}

	componentWillUnmount() {
		window.removeEventListener( 'popstate', this._popstate );
		if ( 'scrollRestoration' in window.history ) {
			window.history.scrollRestoration = 'auto';
		}

		document.removeEventListener( 'keydown', this.handleKeydown, true );

		if ( this.observer ) {
			this.observer.disconnect();
		}

		if ( this.mountTimeout ) {
			clearTimeout( this.mountTimeout );
		}
	}

	handleKeydown = ( event ) => {
		if ( this.props.notificationsOpen ) {
			return;
		}

		const tagName = ( event.target || event.srcElement ).tagName;
		if ( inputTags.includes( tagName ) || event.target.isContentEditable ) {
			return;
		}

		if ( event?.metaKey || event?.ctrlKey ) {
			// avoid conflicting with the command palette shortcut cmd+k
			return;
		}

		switch ( event.keyCode ) {
			// Move selection down - j
			case 74: {
				return this.selectNextItem();
			}

			// Move selection up - k
			case 75: {
				return this.selectPrevItem();
			}

			// Open selection - Enter
			case 13: {
				return this.handleOpenSelection();
			}

			// Open selection in a new tab - v
			case 86: {
				return this.handleOpenSelectionNewTab();
			}

			// Like selection - l
			case 76: {
				return this.toggleLikeOnSelectedPost();
			}

			// Go to top - .
			case 190: {
				return this.goToTop();
			}
		}
	};

	handleOpenSelectionNewTab = () => {
		const { selectedPostKey } = this.props;
		if ( selectedPostKey ) {
			window.open( selectedPostKey.url, '_blank', 'noreferrer,noopener' );
		}
	};

	handleOpenSelection = () => {
		this.props.showSelectedPost( {
			store: this.props.streamKey,
			postKey: this.props.selectedPostKey,
		} );
	};

	toggleLikeOnSelectedPost = () => {
		const { selectedPost } = this.props;

		// only toggle a like on a x-post if we have the appropriate metadata,
		// and original post is full screen
		const xPostMetadata = XPostHelper.getXPostMetadata( selectedPost );
		if ( xPostMetadata?.postURL ) {
			return;
		}

		if ( shouldShowLikes( selectedPost ) ) {
			this.toggleLikeAction();
		}
	};

	toggleLikeAction() {
		const { likedPost, selectedPost } = this.props;
		if ( likedPost === null ) {
			// unknown... ignore for now
			return;
		}

		const toggler = likedPost ? this.props.unlikePost : this.props.likePost;
		toggler( selectedPost.site_ID, selectedPost.ID, { source: 'reader' } );
	}

	goToTop = () => {
		const { streamKey, updateCount } = this.props;
		if ( updateCount > 0 ) {
			this.props.showUpdates( { streamKey } );
		}
	};

	getVisibleItemIndexes() {
		return (
			this.listRef.current &&
			this.listRef.current.getVisibleItemIndexes( { offsetTop: this.props.fixedHeaderHeight || 0 } )
		);
	}

	selectNextItem = () => {
		// note that we grab the items directly from the stream because we don't want the transformed
		// one with combined cards
		const {
			streamKey,
			stream: { items },
		} = this.props;

		// This should already be false but this is a safety.
		this.wasSelectedByOpeningPost = false;

		// If the currently selected item is too far away in scroll position to be rendered by the
		// infinite list, lets fall back to the magic selection functionality noted below.
		const selectedItem = this.state.listContext?.querySelector( '.card.is-selected' );
		// do we have a selected item? if so, just move to the next one
		if ( this.props.selectedPostKey && selectedItem ) {
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

		// This should already be false but this is a safety.
		this.wasSelectedByOpeningPost = false;

		// unlike selectNextItem, we don't want any magic here. Just move back an item if the user
		// currently has a selected item. Otherwise do nothing.
		// We avoid the magic here because we expect users to enter the flow using next, not previous.
		if ( selectedPostKey ) {
			this.props.selectPrevItem( { streamKey, items } );
		}
	};

	poll = () => {
		const { streamKey, localeSlug, selectedFeedId } = this.props;
		this.props.requestPage( {
			streamKey,
			feedId: selectedFeedId,
			isPoll: true,
			localeSlug: localeSlug,
		} );
	};

	getPageHandle = ( pageHandle, startDate ) => {
		if ( pageHandle ) {
			return pageHandle;
		} else if ( startDate ) {
			return { before: startDate };
		}
		return null;
	};

	fetchNextPage = ( options, props = this.props ) => {
		const { streamKey, stream, startDate, localeSlug, selectedFeedId } = props;
		if ( options.triggeredByScroll ) {
			const pageId = pagesByKey.get( streamKey ) || 0;
			pagesByKey.set( streamKey, pageId + 1 );

			props.trackScrollPage( pageId );
		}
		const pageHandle = stream ? this.getPageHandle( stream.pageHandle, startDate ) : null;
		props.requestPage( { feedId: selectedFeedId, streamKey, pageHandle, localeSlug } );
	};

	showUpdates = () => {
		const { streamKey } = this.props;
		this.props.onUpdatesShown();
		this.props.showUpdates( { streamKey } );
		this.scrollFeedListToTop();
	};

	scrollFeedListToTop = () => {
		if ( ! this.listRef.current ) {
			return;
		}

		this.listRef.current.scrollToTop();
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

	renderAppPromo = ( index ) => {
		const { isDiscoverStream } = this.props;
		// Only show it once in the 4th position.
		if ( index !== 3 ) {
			return;
		}

		return (
			isDiscoverStream && (
				<AppPromo
					iconSize={ 40 }
					campaign="calypso-reader-stream"
					title={ this.props.translate( 'Read on the go with the Jetpack Mobile App' ) }
					hasQRCode
					hasGetAppButton={ false }
				/>
			)
		);
	};

	getPostRef = ( postKey ) => {
		return keyToString( postKey );
	};

	renderPost = ( postKey, index ) => {
		const { selectedPostKey, streamKey, primarySiteId } = this.props;
		const isSelected = !! ( selectedPostKey && keysAreEqual( selectedPostKey, postKey ) );

		const itemKey = this.getPostRef( postKey );
		const showPost = ( args ) => {
			// Ensure the post selected becomes the selected item. It may already be the selected
			// item through shortkeys, or not if using a mouse clicking flow. Setting the selected
			// item this way adds consistency to scroll position when coming back from the full post
			// view, as well as avoids conflict between our systems for preserving scroll position
			// and scrolling to selected posts when users use a mix of shortkeys and mouse clicks.
			if ( ! isSelected ) {
				this.props.selectItem( { streamKey: this.props.streamKey, postKey } );
				this.wasSelectedByOpeningPost = true;
			}
			this.props.showSelectedPost( {
				...args,
				postKey: postKey,
				streamKey,
			} );
		};

		return (
			<Fragment key={ itemKey }>
				{ this.renderAppPromo( index ) }
				<PostLifecycle
					ref={ itemKey /* The ref is stored into `InfiniteList`'s `this.ref` map */ }
					isSelected={ isSelected }
					handleClick={ showPost }
					postKey={ postKey }
					suppressSiteNameLink={ this.props.suppressSiteNameLink }
					showFollowInHeader={ this.props.showFollowInHeader }
					isDiscoverStream={ this.props.isDiscoverStream }
					showSiteName={ this.props.showSiteNameOnCards }
					selectedPostKey={ undefined }
					followSource={ this.props.followSource }
					blockedSites={ this.props.blockedSites }
					streamKey={ streamKey }
					recsStreamKey={ this.props.recsStreamKey }
					index={ index }
					compact={ this.props.useCompactCards }
					siteId={ primarySiteId }
					showFollowButton={ this.props.showFollowButton }
					fixedHeaderHeight={ this.props.fixedHeaderHeight }
				/>
				{ index === 0 && <ReaderPerformanceTrackerStop /> }
			</Fragment>
		);
	};

	setListContext = ( component ) => {
		if ( ! component ) {
			return;
		}

		this.listRef.current = component;
		this.setState( {
			listContext: this.getScrollContainer( ReactDom.findDOMNode( component ) ),
		} );
	};

	getScrollContainer = ( node ) => {
		// Leave it to the default scroll container if we cannot find it or its the root element.
		if ( ! node || node.ownerDocument === node.parentNode ) {
			return false;
		}

		// Return when overflow is defined to either auto or scroll.
		const { overflowY } = getComputedStyle( node );
		if ( /(auto|scroll)/.test( overflowY ) ) {
			return node;
		}

		// Continue traversing.
		return this.getScrollContainer( node.parentNode );
	};

	render() {
		const { translate, forcePlaceholders, lastPage, streamHeader, streamKey, selectedPostKey } =
			this.props;
		const wideDisplay = this.props.width > WIDE_DISPLAY_CUTOFF;
		const isReaderCouncilStream = false; // Disabling banner. Original condition: ( this.props.isDiscoverStream || this.props.streamKey === 'following' );
		let { items, isRequesting } = this.props;
		let body;
		let showingStream;

		// trick an infinite list to showing placeholders
		if ( forcePlaceholders ) {
			items = [];
			isRequesting = true;
		}

		const hasNoPosts = this.isMounted && items.length === 0 && ! isRequesting;

		const streamType = getStreamType( streamKey );

		// TODO: `following` probably shouldn't be added as a class to every stream, but style selectors need
		// to be updated before we can remove it.
		let baseClassnames = clsx( 'following', this.props.className );

		// @TODO: has error of invalid tag?
		if ( hasNoPosts ) {
			body = this.props.emptyContent?.();
			if ( ! body && this.props.showDefaultEmptyContentIfMissing ) {
				body = <EmptyContent />;
			}
			showingStream = false;
		} else {
			/* eslint-disable wpcalypso/jsx-classname-namespace */
			const bodyContent = (
				<InfiniteList
					ref={ this.setListContext }
					items={ items }
					lastPage={ lastPage }
					fetchingNextPage={ isRequesting }
					guessedItemHeight={ GUESSED_POST_HEIGHT }
					fetchNextPage={ this.fetchNextPage }
					getItemRef={ this.getPostRef }
					renderItem={ this.renderPost }
					renderLoadingPlaceholders={ this.renderLoadingPlaceholders }
					className="stream__list"
					context={ this.state.listContext }
					selectedItem={ selectedPostKey }
				/>
			);

			const sidebarContentFn = this.props.streamSidebar;

			// Exclude the sidebar layout for the search stream, since it's handled by `<SiteResults>`.
			if ( ! sidebarContentFn || streamType === 'search' ) {
				body = <div className="reader__content">{ bodyContent }</div>;
			} else if ( wideDisplay ) {
				body = (
					<div className="stream__two-column">
						<div className="reader__content">
							{ streamHeader?.() }
							{ isReaderCouncilStream && <CustomerCouncilBanner translate={ translate } /> }
							{ bodyContent }
						</div>
						<div className="stream__right-column">{ sidebarContentFn?.() }</div>
					</div>
				);
				baseClassnames = clsx( 'reader-two-column', baseClassnames );
			} else {
				body = (
					<>
						{ streamHeader?.() }
						{ isReaderCouncilStream && (
							<div style={ { margin: '32px 16px 0' } }>
								<CustomerCouncilBanner translate={ translate } />
							</div>
						) }
						<div className="stream__header">
							<SectionNav selectedText={ this.state.selectedTab }>
								<NavTabs label={ translate( 'Status' ) }>
									<NavItem
										key="posts"
										selected={ this.state.selectedTab === 'posts' }
										onClick={ this.handlePostsSelected }
									>
										{ translate( 'Posts' ) }
									</NavItem>
									<NavItem
										key="sites"
										selected={ this.state.selectedTab === 'sites' }
										onClick={ this.handleSitesSelected }
									>
										{ this.props.sidebarTabTitle || translate( 'Subscriptions' ) }
									</NavItem>
								</NavTabs>
							</SectionNav>
						</div>
						{ this.state.selectedTab === 'posts' && (
							<div className="reader__content">{ bodyContent }</div>
						) }
						{ this.state.selectedTab === 'sites' && (
							<div className="stream__right-column">{ sidebarContentFn?.() }</div>
						) }
					</>
				);
			}
			showingStream = true;
			/* eslint-enable wpcalypso/jsx-classname-namespace */
		}
		// Check array of streamTypes to see if we should poll for updates;
		const shouldPoll = ! [ 'search', 'custom_recs_posts_with_images', 'discover' ].includes(
			streamType
		);

		const TopLevel = this.props.isMain ? ReaderMain : 'div';

		return (
			<TopLevel className={ baseClassnames }>
				<div ref={ this.overlayRef } className="stream__init-overlay" />
				{ shouldPoll && <Interval onTick={ this.poll } period={ EVERY_MINUTE } /> }

				<UpdateNotice streamKey={ streamKey } onClick={ this.showUpdates } />
				{ this.props.children }
				{ showingStream && items.length ? this.props.intro?.() : null }
				{ body }
				{ showingStream && !! items.length && ! isRequesting && (
					<>
						<ListEnd />
						{ streamKey.startsWith( 'following' ) && (
							<div className="stream__caught-up">
								<p>{ translate( "You've seen all new posts from the past 60 days." ) }</p>
								<p>
									{ this.props.selectedFeedId
										? translate( "Visit {{link}}this site's feed{{/link}} to view older posts.", {
												components: {
													link: <a href={ `/read/feeds/${ this.props.selectedFeedId }` } />,
												},
										  } )
										: translate( 'Visit the individual site to view older posts.' ) }
								</p>
							</div>
						) }
					</>
				) }
			</TopLevel>
		);
	}
}

/**
 * Returns a modified stream key if necessary else returns the original stream key.
 * @returns {string} Stream key.
 */
function getStreamKey( state, streamKey ) {
	// For "following" stream, use a unique streamKey if a feed is selected. This prevent feed overwrites when rapid selections are made.
	const selectedFeedId = getSelectedFeedId( state );
	const isFollowingFiltered = streamKey === 'following' && selectedFeedId;
	if ( isFollowingFiltered ) {
		return `following:feed-${ selectedFeedId }`;
	}

	return streamKey;
}

export default connect(
	( state, { streamKey: tempStreamKey, recsStreamKey } ) => {
		const streamKey = getStreamKey( state, tempStreamKey );
		const stream = getStream( state, streamKey );
		const selectedPost = getPostByKey( state, stream.selected );

		let localeSlug = getCurrentLocaleSlug( state );
		if ( isDefaultLocale( localeSlug ) ) {
			localeSlug = null;
		}

		return {
			blockedSites: getBlockedSites( state ),
			items: getTransformedStreamItems( state, {
				streamKey,
				recsStreamKey,
			} ),
			notificationsOpen: isNotificationsOpen( state ),
			stream,
			streamKey,
			recsStream: getStream( state, recsStreamKey ),
			selectedFeedId: getSelectedFeedId( state ),
			selectedPostKey: stream.selected,
			selectedPost,
			lastPage: stream.lastPage,
			isRequesting: stream.isRequesting,
			shouldRequestRecs: shouldRequestRecs( state, streamKey, recsStreamKey ),
			likedPost: selectedPost && isLikedPost( state, selectedPost.site_ID, selectedPost.ID ),
			organizations: getReaderOrganizations( state ),
			primarySiteId: getPrimarySiteId( state ),
			localeSlug,
		};
	},
	{
		clearStream,
		resetCardExpansions,
		likePost,
		unlikePost,
		requestPage,
		selectItem,
		selectNextItem,
		selectPrevItem,
		showSelectedPost,
		showUpdates,
		viewStream,
	}
)( localize( withDimensions( ReaderStream ) ) );
