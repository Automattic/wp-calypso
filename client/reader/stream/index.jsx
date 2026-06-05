import './style.scss';
import { isDefaultLocale } from '@automattic/i18n-utils';
import clsx from 'clsx';
import { localize } from 'i18n-calypso';
import { times } from 'lodash';
import PropTypes from 'prop-types';
import { Component, Fragment } from 'react';
import * as React from 'react';
import { connect, useDispatch } from 'react-redux';
import AppPromo from 'calypso/blocks/app-promo';
import InfiniteList from 'calypso/components/infinite-list';
import ListEnd from 'calypso/components/list-end';
import SectionNav from 'calypso/components/section-nav';
import NavItem from 'calypso/components/section-nav/item';
import NavTabs from 'calypso/components/section-nav/tabs';
import withDimensions from 'calypso/lib/with-dimensions';
import ReaderMain from 'calypso/reader/components/reader-main';
import { useSiteSubscriptions } from 'calypso/reader/data/site-subscriptions';
import {
	analyticsForStream,
	INITIAL_FETCH,
	normalizeStreamPage,
	PER_FETCH,
	useInfiniteStream,
} from 'calypso/reader/data/stream';
import { keyToString } from 'calypso/reader/post-key';
import { MAX_POSTS_FOR_LOGGED_OUT_USERS } from 'calypso/reader/reader.const';
import ReaderStreamLoginPrompt from 'calypso/reader/stream/login-prompt';
import UpdateNotice from 'calypso/reader/update-notice';
import { showSelectedPost, getStreamType } from 'calypso/reader/utils';
import { isUserLoggedIn } from 'calypso/state/current-user/selectors';
import { getBlockedSites } from 'calypso/state/reader/site-blocks/selectors';
import { viewStream } from 'calypso/state/reader-ui/actions';
import { resetCardExpansions } from 'calypso/state/reader-ui/card-expansions/actions';
import { getSelectedRecentFeedId } from 'calypso/state/reader-ui/sidebar/selectors';
import getCurrentLocaleSlug from 'calypso/state/selectors/get-current-locale-slug';
import getPrimarySiteId from 'calypso/state/selectors/get-primary-site-id';
import { ReaderPerformanceTrackerStop } from '../reader-performance-tracker';
import { CustomerCouncilBanner } from './customer-council-banner';
import EmptyContent from './empty';
import { StreamError } from './error';
import PostLifecycle from './post-lifecycle';
import PostPlaceholder from './post-placeholder';
import { useStreamPendingPosts } from './use-stream-pending-posts';
import {
	getDistanceBetweenPrompts,
	getDistanceBetweenRecs,
	injectPrompts,
	injectRecommendations,
} from './utils';
// minimal size for the two-column layout to show without cut off
// 64 is padding, 8 is margin
export const WIDE_DISPLAY_CUTOFF = 950 + 64 * 2 + 8 * 2;
const GUESSED_POST_HEIGHT = 600;
const noop = () => {};
const pagesByKey = new Map();

const useStreamRenderAnalytics = ( pages, streamKey ) => {
	const dispatch = useDispatch();
	const processedPages = React.useRef( new WeakSet() );
	const streamType = getStreamType( streamKey ?? '' );

	React.useEffect( () => {
		processedPages.current = new WeakSet();
	}, [ streamKey ] );

	React.useEffect( () => {
		if ( ! streamKey ) {
			return;
		}

		for ( const page of pages ) {
			if ( processedPages.current.has( page ) ) {
				continue;
			}
			processedPages.current.add( page );
			const { streamPosts } = normalizeStreamPage( page, streamType );
			if ( streamPosts.length > 0 ) {
				analyticsForStream( {
					streamKey,
					algorithm: page.algorithm,
					items: streamPosts,
				} ).forEach( ( action ) => dispatch( action ) );
			}
		}
	}, [ pages, streamKey, streamType, dispatch ] );
};

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
		hideDefaultEmptyContentIfMissing: PropTypes.bool,
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
		isLoggedIn: PropTypes.bool,
		wideLayout: PropTypes.bool,
		showBylineSecondarySiteLink: PropTypes.bool,
		followsCount: PropTypes.number,
		refetch: PropTypes.func,
		fetchNextPage: PropTypes.func,
		pendingCount: PropTypes.number,
		consumePending: PropTypes.func,
	};

	static defaultProps = {
		className: '',
		forcePlaceholders: false,
		intro: null,
		isDiscoverStream: false,
		isMain: true,
		onUpdatesShown: noop,
		showFollowButton: true,
		showFollowInHeader: false,
		suppressSiteNameLink: false,
		useCompactCards: false,
		isLoggedIn: false,
		wideLayout: false,
		showBylineSecondarySiteLink: true,
	};

	state = {
		selectedTab: 'posts',
	};

	isMounted = false;

	handlePostsSelected = () => {
		this.setState( { selectedTab: 'posts' } );
	};
	handleSitesSelected = () => {
		this.setState( { selectedTab: 'sites' } );
	};

	componentDidUpdate( { streamKey } ) {
		if ( streamKey !== this.props.streamKey ) {
			this.props.resetCardExpansions();
			this.props.viewStream( streamKey, window.location.pathname );
		}
	}

	tryAgain = () => {
		this.props.refetch();
	};

	componentDidMount() {
		const { streamKey } = this.props;
		this.props.resetCardExpansions();
		this.props.viewStream( streamKey, window.location.pathname );
		this.isMounted = true;
	}

	getPageHandle = ( pageHandle, startDate ) => {
		if ( pageHandle ) {
			return pageHandle;
		} else if ( startDate ) {
			return { before: startDate };
		}
		return null;
	};

	fetchNextPage = ( options, props = this.props ) => {
		if ( this.isLoginPromptVisible() ) {
			return;
		}

		const { streamKey } = props;
		if ( options.triggeredByScroll ) {
			const pageId = pagesByKey.get( streamKey ) || 0;
			pagesByKey.set( streamKey, pageId + 1 );

			props.trackScrollPage( pageId );
		}
		props.fetchNextPage();
	};

	isLoginPromptVisible = () => {
		// Show login prompt for all logged out users after few posts.
		return ! this.props.isLoggedIn && this.props.items.length > MAX_POSTS_FOR_LOGGED_OUT_USERS;
	};

	showUpdates = () => {
		this.props.onUpdatesShown();
		this.props.consumePending();
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

	// Light-weight loading hint shown above the list while the user-triggered
	// refetch (e.g. clicking the "X new posts" pill) is in flight. Two skeleton
	// rows are enough to communicate "new posts are coming" without pushing the
	// existing list too far down.
	renderRefreshingPlaceholders = () => {
		return times( 2, ( i ) => {
			if ( this.props.placeholderFactory ) {
				return this.props.placeholderFactory( { key: 'refresh-placeholder-' + i } );
			}
			return <PostPlaceholder key={ 'refresh-placeholder-' + i } />;
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
		const { streamKey, primarySiteId } = this.props;

		const itemKey = this.getPostRef( postKey );
		const showPost = ( args ) => {
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
					isSelected={ false }
					handleClick={ showPost }
					postKey={ postKey }
					suppressSiteNameLink={ this.props.suppressSiteNameLink }
					showFollowInHeader={ this.props.showFollowInHeader }
					isDiscoverStream={ this.props.isDiscoverStream }
					showSiteName={ this.props.showSiteNameOnCards }
					followSource={ this.props.followSource }
					blockedSites={ this.props.blockedSites }
					streamKey={ streamKey }
					recsStreamKey={ this.props.recsStreamKey }
					showBylineSecondarySiteLink={ this.props.showBylineSecondarySiteLink }
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

	render() {
		const { translate, forcePlaceholders, lastPage, streamHeader, streamKey } = this.props;
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

		const hasNoPosts = this.isMounted && items.length === 0 && ! isRequesting && ! this.props.error;

		const streamType = getStreamType( streamKey );

		// TODO: `following` probably shouldn't be added as a class to every stream, but style selectors need
		// to be updated before we can remove it.
		let baseClassnames = clsx(
			'following',
			'reader-stream__browser-scroll-poc',
			this.props.className
		);
		const SidebarContent =
			typeof this.props.streamSidebar === 'function'
				? this.props.streamSidebar( wideDisplay )
				: null;

		if ( hasNoPosts ) {
			let emptyBody = this.props.emptyContent?.();
			if ( ! emptyBody && ! this.props.hideDefaultEmptyContentIfMissing ) {
				emptyBody = <EmptyContent />;
			}

			// In wide display with a sidebar, render the two-column layout so the sidebar
			// (with follow button, subscriber count, tags) remains visible for empty feeds.
			if ( wideDisplay && SidebarContent && streamType !== 'search' ) {
				body = (
					<div className="stream__two-column">
						<div className="reader__content">{ emptyBody }</div>
						<div className="stream__right-column">{ SidebarContent }</div>
					</div>
				);
				baseClassnames = clsx( 'is-two-columns', baseClassnames );
			} else {
				body = emptyBody;
			}
			showingStream = false;
		} else {
			/* eslint-disable wpcalypso/jsx-classname-namespace */
			const bodyContent = (
				<>
					<InfiniteList
						key={ this.props.streamKey }
						items={ items }
						lastPage={ lastPage }
						fetchingNextPage={ isRequesting }
						guessedItemHeight={ GUESSED_POST_HEIGHT }
						fetchNextPage={ this.fetchNextPage }
						getItemRef={ this.getPostRef }
						renderItem={ this.renderPost }
						renderLoadingPlaceholders={ this.renderLoadingPlaceholders }
						className="stream__list"
						restoreScroll={ false }
					/>
				</>
			);

			// Exclude the sidebar layout for the search stream, since it's handled by `<SiteResults>`.
			if ( ! SidebarContent || streamType === 'search' ) {
				body = (
					<div className="reader__content">
						{ isReaderCouncilStream && <CustomerCouncilBanner translate={ translate } /> }
						{ bodyContent }
					</div>
				);
			} else if ( wideDisplay ) {
				body = (
					<div className="stream__two-column">
						<div className="reader__content">
							{ streamHeader?.() }
							{ isReaderCouncilStream && <CustomerCouncilBanner translate={ translate } /> }
							{ bodyContent }
						</div>
						<div className="stream__right-column">{ SidebarContent }</div>
					</div>
				);
				baseClassnames = clsx( 'is-two-columns', baseClassnames );
			} else {
				body = (
					<>
						{ streamHeader?.() }
						{ isReaderCouncilStream && (
							<div style={ { margin: '32px 16px 0' } }>
								<CustomerCouncilBanner translate={ translate } />
							</div>
						) }
						<div className="stream__container">
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
								<div className="stream__right-column">{ SidebarContent }</div>
							) }
						</div>
					</>
				);
			}
			showingStream = true;
			/* eslint-enable wpcalypso/jsx-classname-namespace */
		}

		const TopLevel = this.props.isMain ? ReaderMain : 'div';

		if ( this.props.error ) {
			body = (
				<StreamError
					onTryAgain={ this.tryAgain }
					streamKey={ streamKey }
					error={ this.props.error }
					context={ this.state.selectedTab }
				/>
			);
		}

		return (
			<TopLevel className={ baseClassnames } wideLayout={ this.props.wideLayout }>
				<UpdateNotice count={ this.props.pendingCount } onClick={ this.showUpdates } />
				{ this.props.children }
				{ showingStream && items.length ? this.props.intro?.() : null }
				{ body }
				{ showingStream && items.length && ! isRequesting ? <ListEnd /> : null }
				{ this.isLoginPromptVisible() && (
					<ReaderStreamLoginPrompt redirectPath={ window.location.pathname } />
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
	const selectedFeedId = getSelectedRecentFeedId( state );
	const isFollowingFiltered = streamKey === 'following' && selectedFeedId;
	if ( isFollowingFiltered ) {
		return `following:feed-${ selectedFeedId }`;
	}

	return streamKey;
}

const withStreamPosts = ( WrappedComponent ) =>
	function StreamPostsContainer( props ) {
		const { count: followsCount } = useSiteSubscriptions();
		const streamPostsQuery = useInfiniteStream( {
			streamKey: props.streamKey,
			feedId: props.selectedFeedId,
			localeSlug: props.localeSlug,
			startDate: props.startDate,
			options: {
				enabled: ! props.forcePlaceholders,
			},
		} );

		const recsStreamPostsQuery = useInfiniteStream( {
			streamKey: props.recsStreamKey,
			localeSlug: props.localeSlug,
			options: {
				enabled: ! props.forcePlaceholders && streamPostsQuery.items.length > 0,
			},
		} );

		useStreamRenderAnalytics( streamPostsQuery.pages, props.streamKey );
		useStreamRenderAnalytics( recsStreamPostsQuery.pages, props.recsStreamKey );

		const items = React.useMemo( () => {
			const withRecommendations =
				props.recsStreamKey && recsStreamPostsQuery.items.length > 0
					? injectRecommendations(
							streamPostsQuery.items,
							recsStreamPostsQuery.items,
							getDistanceBetweenRecs( followsCount )
					  )
					: streamPostsQuery.items;

			return injectPrompts( withRecommendations, getDistanceBetweenPrompts( followsCount ) );
		}, [ followsCount, props.recsStreamKey, recsStreamPostsQuery.items, streamPostsQuery.items ] );

		const streamType = getStreamType( props.streamKey ?? '' );
		const shouldPoll =
			! [ 'search', 'custom_recs_posts_with_images', 'discover' ].includes( streamType ) &&
			! props.forcePlaceholders;

		const {
			pendingCount,
			hasPendingPosts,
			reset: resetPending,
		} = useStreamPendingPosts( {
			streamKey: props.streamKey,
			feedId: props.selectedFeedId,
			localeSlug: props.localeSlug,
			startDate: props.startDate,
			shouldPoll,
			items: streamPostsQuery.items,
		} );

		// Mark the infinite query stale (without refetching) the moment the
		// poll spots new posts. The user's current scroll position stays put;
		// the next time they navigate back to this stream the remount picks
		// up the fresh data.
		const { invalidate } = streamPostsQuery;
		React.useEffect( () => {
			if ( hasPendingPosts ) {
				invalidate();
			}
		}, [ hasPendingPosts, invalidate ] );

		// Click handler for `<UpdateNotice>`: refetch all loaded pages now and
		// drop the polled head from cache so the pill clears immediately
		// (instead of flickering until the next poll tick recomputes against
		// the freshly refetched items).
		const { refetch } = streamPostsQuery;
		const consumePending = React.useCallback( () => {
			refetch();
			resetPending();
		}, [ refetch, resetPending ] );

		return (
			<WrappedComponent
				{ ...props }
				items={ items }
				lastPage={ streamPostsQuery.lastPage }
				followsCount={ followsCount }
				isRequesting={
					streamPostsQuery.isLoading ||
					streamPostsQuery.isFetchingNextPage ||
					streamPostsQuery.isRefetching
				}
				error={ streamPostsQuery.error }
				refetch={ refetch }
				fetchNextPage={ streamPostsQuery.fetchNextPage }
				pendingCount={ pendingCount }
				consumePending={ consumePending }
			/>
		);
	};

export default connect(
	( state, { streamKey: tempStreamKey } ) => {
		const streamKey = getStreamKey( state, tempStreamKey );
		const isLoggedIn = isUserLoggedIn( state );

		let localeSlug = getCurrentLocaleSlug( state );
		if ( isDefaultLocale( localeSlug ) ) {
			localeSlug = null;
		}

		return {
			blockedSites: getBlockedSites( state ),
			streamKey,
			selectedFeedId: getSelectedRecentFeedId( state ),
			primarySiteId: getPrimarySiteId( state ),
			localeSlug,
			isLoggedIn,
		};
	},
	{
		resetCardExpansions,
		showSelectedPost,
		viewStream,
	}
)( localize( withDimensions( withStreamPosts( ReaderStream ) ) ) );
