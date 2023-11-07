import { CompactCard } from '@automattic/components';
import { localize } from 'i18n-calypso';
import { trim, debounce, random, reject, includes } from 'lodash';
import page from 'page';
import PropTypes from 'prop-types';
import { stringify } from 'qs';
import { Component, Fragment } from 'react';
import * as React from 'react';
import { connect } from 'react-redux';
import RecommendedSites from 'calypso/blocks/reader-recommended-sites';
import DocumentHead from 'calypso/components/data/document-head';
import QueryReaderFeedsSearch from 'calypso/components/data/query-reader-feeds-search';
import QueryReaderRecommendedSites from 'calypso/components/data/query-reader-recommended-sites';
import HeaderCake from 'calypso/components/header-cake';
import SearchInput from 'calypso/components/search';
import { resemblesUrl, addQueryArgs } from 'calypso/lib/url';
import ReaderMain from 'calypso/reader/components/reader-main';
import { READER_FOLLOWING_MANAGE_RECOMMENDATION } from 'calypso/reader/follow-sources';
import SearchFollowButton from 'calypso/reader/search-stream/search-follow-button';
import { recordAction } from 'calypso/reader/stats';
import { recordReaderTracksEvent } from 'calypso/state/reader/analytics/actions';
import { SORT_BY_RELEVANCE } from 'calypso/state/reader/feed-searches/actions';
import {
	getReaderFeedsCountForQuery,
	getReaderFeedsForQuery,
} from 'calypso/state/reader/feed-searches/selectors';
import { getFeed } from 'calypso/state/reader/feeds/selectors';
import {
	getReaderAliasedFollowFeedUrl,
	getReaderFollowsCount,
	isReaderFollowsLoading,
} from 'calypso/state/reader/follows/selectors';
import {
	getReaderRecommendedSites,
	getReaderRecommendedSitesPagingOffset,
} from 'calypso/state/reader/recommended-sites/selectors';
import { getBlockedSites } from 'calypso/state/reader/site-blocks/selectors';
import { getDismissedSites } from 'calypso/state/reader/site-dismissals/selectors';
import FollowingManageEmptyContent from './empty';
import FollowingManageSearchFeedsResults from './feed-search-results';
import FollowingManageSubscriptions from './subscriptions';
import FollowingManageSubscriptionsPlaceholder from './subscriptions-placeholder';
import './style.scss';

const PAGE_SIZE = 4;
let recommendationsSeed = random( 0, 10000 );

class FollowingManage extends Component {
	static propTypes = {
		sitesQuery: PropTypes.string,
		subsQuery: PropTypes.string,
		subsSortOrder: PropTypes.oneOf( [ 'date-followed', 'alpha', 'date-updated' ] ),
		translate: PropTypes.func,
		showMoreResults: PropTypes.bool,
	};

	static defaultProps = {
		subsQuery: '',
		sitesQuery: '',
		showMoreResults: false,
		subsSortOrder: 'date-followed',
	};

	state = {
		width: 800,
	};

	// TODO make this common between our different search pages?
	updateQuery = ( newValue ) => {
		this.scrollToTop();
		const trimmedValue = trim( newValue ).substring( 0, 1024 );
		if (
			( trimmedValue !== '' && trimmedValue.length > 1 && trimmedValue !== this.props.query ) ||
			newValue === ''
		) {
			let searchUrl = '/following/manage';
			if ( newValue ) {
				searchUrl += '?' + stringify( { q: newValue } );
				this.props.recordReaderTracksEvent( 'calypso_reader_following_manage_search_performed', {
					query: newValue,
				} );
				recordAction( 'manage_feed_search' );
			}
			page.replace( searchUrl );
		}
	};

	handleSearchClosed = () => {
		this.scrollToTop();
		this.props.recordReaderTracksEvent( 'calypso_reader_following_manage_search_closed' );
		recordAction( 'manage_feed_search_closed' );
	};

	scrollToTop = () => {
		window.scrollTo( 0, 0 );
	};

	handleStreamMounted = ( ref ) => ( this.streamRef = ref );
	handleSearchBoxMounted = ( ref ) => ( this.searchBoxRef = ref );
	handleWindowScrollerMounted = ( ref ) => ( this.windowScrollerRef = ref );

	resizeSearchBox = () => {
		if ( this.searchBoxRef && this.streamRef ) {
			const width = this.streamRef.getClientRects()[ 0 ].width;
			if ( width > 0 ) {
				this.searchBoxRef.style.width = `${ width }px`;
			}
			this.setState( { width } );
		}
	};

	componentDidMount() {
		this.resizeListener = window.addEventListener( 'resize', debounce( this.resizeSearchBox, 50 ) );
		this.resizeSearchBox();

		// this is a total hack. In React-Virtualized you need to tell a WindowScroller when the things
		// above it has moved with a call to updatePosition().  Our issue is we don't have a good moment
		// where we know that the content above the WindowScroller has settled down and so instead the solution
		// here is to call updatePosition in a regular interval. the call takes about 0.1ms from empirical testing.
		this.updatePosition = setInterval( () => {
			this.windowScrollerRef && this.windowScrollerRef.updatePosition();
		}, 300 );

		this.reportFollowByUrlRender();
	}

	componentWillUnmount() {
		recommendationsSeed = random( 0, 1000 );
		window.removeEventListener( 'resize', this.resizeListener );
		clearInterval( this.windowScrollerRef );
	}

	shouldRequestMoreRecs = () => {
		const { recommendedSites, blockedSites, dismissedSites } = this.props;

		return (
			reject(
				recommendedSites,
				( site ) => includes( blockedSites, site.blogId ) || includes( dismissedSites, site.blogId )
			).length <= 4
		);
	};

	handleShowMoreClicked = () => {
		this.props.recordReaderTracksEvent( 'calypso_reader_following_manage_search_more_click' );
		recordAction( 'manage_feed_search_more' );
		page.replace(
			addQueryArgs( { showMoreResults: true }, window.location.pathname + window.location.search )
		);
	};

	reportFollowByUrlRender = () => {
		const siteUrl = this.props.readerAliasedFollowFeedUrl;
		const showingFollowByUrlButton = this.shouldShowFollowByUrl();

		if ( siteUrl && showingFollowByUrlButton ) {
			this.props.recordReaderTracksEvent( 'calypso_reader_following_manage_follow_by_url_render', {
				url: siteUrl,
			} );
		}
	};

	shouldShowFollowByUrl = () => resemblesUrl( this.props.sitesQuery );

	componentDidUpdate( prevProps ) {
		if ( this.props.readerAliasedFollowFeedUrl !== prevProps.readerAliasedFollowFeedUrl ) {
			this.reportFollowByUrlRender();
		}
	}

	goBack() {
		if ( typeof window !== 'undefined' ) {
			window.history.back();
		}
	}

	render() {
		const {
			sitesQuery,
			subsQuery,
			subsSortOrder,
			translate,
			searchResults,
			searchResultsCount,
			showMoreResults,
			recommendedSites,
			recommendedSitesPagingOffset,
			blockedSites,
			dismissedSites,
			followsCount,
			isFollowsLoading,
			feed,
		} = this.props;
		const searchPlaceholderText = translate( 'Search or enter URL to follow…' );
		const hasFollows = followsCount > 0;
		const showExistingSubscriptions = hasFollows && ! showMoreResults;
		const showFollowByUrl = this.shouldShowFollowByUrl();
		const isFollowByUrlWithNoSearchResults = showFollowByUrl && searchResultsCount === 0;

		const filteredRecommendedSites = reject(
			recommendedSites,
			( site ) => includes( blockedSites, site.blogId ) || includes( dismissedSites, site.blogId )
		);

		/* eslint-disable jsx-a11y/no-autofocus */
		return (
			<Fragment>
				<div className="following-manage__header">
					<HeaderCake onClick={ this.goBack }>
						<h1>{ translate( 'Manage Followed Sites' ) }</h1>
					</HeaderCake>
				</div>
				<ReaderMain className="following-manage">
					<DocumentHead title="Manage Following" />
					{ ! searchResults && sitesQuery && (
						<QueryReaderFeedsSearch query={ sitesQuery } excludeFollowed={ true } />
					) }
					{ this.shouldRequestMoreRecs() && (
						<QueryReaderRecommendedSites
							seed={ recommendationsSeed }
							offset={ recommendedSitesPagingOffset + PAGE_SIZE || 0 }
						/>
					) }
					<div ref={ this.handleStreamMounted } />
					<div className="following-manage__fixed-area" ref={ this.handleSearchBoxMounted }>
						<CompactCard className="following-manage__input-card">
							<SearchInput
								onSearch={ this.updateQuery }
								onSearchClose={ this.handleSearchClosed }
								autoFocus={ this.props.autoFocusInput }
								delaySearch={ true }
								delayTimeout={ 500 }
								placeholder={ searchPlaceholderText }
								additionalClasses="following-manage__search-new"
								initialValue={ sitesQuery }
								value={ sitesQuery }
								maxLength={ 500 }
								disableAutocorrect={ true }
							/>
						</CompactCard>

						<SearchFollowButton query={ sitesQuery } feed={ feed ?? null } />
					</div>
					{ ! sitesQuery && (
						<RecommendedSites
							sites={ filteredRecommendedSites.slice( 0, 2 ) }
							followSource={ READER_FOLLOWING_MANAGE_RECOMMENDATION }
						/>
					) }
					{ !! sitesQuery && ! isFollowByUrlWithNoSearchResults && (
						<FollowingManageSearchFeedsResults
							searchResults={ searchResults }
							showMoreResults={ showMoreResults }
							onShowMoreResultsClicked={ this.handleShowMoreClicked }
							width={ this.state.width }
							searchResultsCount={ searchResultsCount }
							query={ sitesQuery }
						/>
					) }
					{ showExistingSubscriptions && (
						<FollowingManageSubscriptions
							width={ this.state.width }
							query={ subsQuery }
							sortOrder={ subsSortOrder }
							windowScrollerRef={ this.handleWindowScrollerMounted }
						/>
					) }
					{ ! hasFollows && isFollowsLoading && <FollowingManageSubscriptionsPlaceholder /> }
					{ ! hasFollows && ! isFollowsLoading && <FollowingManageEmptyContent /> }
				</ReaderMain>
			</Fragment>
		);
		/* eslint-enable jsx-a11y/no-autofocus */
	}
}

export default connect(
	( state, { sitesQuery } ) => {
		const searchResults = getReaderFeedsForQuery( state, {
			query: sitesQuery,
			excludeFollowed: true,
			sort: SORT_BY_RELEVANCE,
		} );

		let feed = null;
		// Check if searchResults has one item and if it has a feed_ID
		if ( searchResults && searchResults.length === 1 ) {
			feed = searchResults[ 0 ];
			if ( feed.feed_ID.length > 0 ) {
				// If it has a feed_id, get the feed object from the state
				feed = getFeed( state, feed.feed_ID );
			}
		}
		return {
			searchResults: searchResults,
			searchResultsCount: getReaderFeedsCountForQuery( state, {
				query: sitesQuery,
				excludeFollowed: true,
				sort: SORT_BY_RELEVANCE,
			} ),
			recommendedSites: getReaderRecommendedSites( state, recommendationsSeed ),
			recommendedSitesPagingOffset: getReaderRecommendedSitesPagingOffset(
				state,
				recommendationsSeed
			),
			blockedSites: getBlockedSites( state ),
			dismissedSites: getDismissedSites( state ),
			readerAliasedFollowFeedUrl: sitesQuery && getReaderAliasedFollowFeedUrl( state, sitesQuery ),
			followsCount: getReaderFollowsCount( state ),
			isFollowsLoading: isReaderFollowsLoading( state ),
			feed: feed,
		};
	},
	{ recordReaderTracksEvent }
)( localize( FollowingManage ) );
