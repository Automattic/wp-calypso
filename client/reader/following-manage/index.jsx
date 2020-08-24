/**
 * External Dependencies
 */
import React, { Component, Fragment } from 'react';
import { connect } from 'react-redux';
import { trim, debounce, random, take, reject, includes } from 'lodash';
import { localize } from 'i18n-calypso';
import page from 'page';
import PropTypes from 'prop-types';
import { stringify } from 'qs';

/**
 * Internal Dependencies
 */
import { CompactCard } from '@automattic/components';
import DocumentHead from 'components/data/document-head';
import SearchInput from 'components/search';
import HeaderCake from 'components/header-cake';
import ReaderMain from 'reader/components/reader-main';
import { getBlockedSites } from 'state/reader/site-blocks/selectors';
import { getDismissedSites } from 'state/reader/site-dismissals/selectors';
import {
	getReaderFeedsCountForQuery,
	getReaderFeedsForQuery,
} from 'state/reader/feed-searches/selectors';
import {
	getReaderAliasedFollowFeedUrl,
	getReaderFollowsCount,
} from 'state/reader/follows/selectors';
import {
	getReaderRecommendedSites,
	getReaderRecommendedSitesPagingOffset,
} from 'state/reader/recommended-sites/selectors';
import QueryReaderFeedsSearch from 'components/data/query-reader-feeds-search';
import QueryReaderRecommendedSites from 'components/data/query-reader-recommended-sites';
import RecommendedSites from 'blocks/reader-recommended-sites';
import FollowingManageSubscriptions from './subscriptions';
import FollowingManageSearchFeedsResults from './feed-search-results';
import FollowingManageEmptyContent from './empty';
import FollowButton from 'reader/follow-button';
import {
	READER_FOLLOWING_MANAGE_URL_INPUT,
	READER_FOLLOWING_MANAGE_RECOMMENDATION,
} from 'reader/follow-sources';
import { resemblesUrl, withoutHttp, addSchemeIfMissing, addQueryArgs } from 'lib/url';
import { recordTrack, recordAction } from 'reader/stats';
import { SORT_BY_RELEVANCE } from 'state/reader/feed-searches/actions';

/**
 * Style dependencies
 */
import './style.scss';

const PAGE_SIZE = 4;
let recommendationsSeed = random( 0, 10000 );

class FollowingManage extends Component {
	static propTypes = {
		sitesQuery: PropTypes.string,
		subsQuery: PropTypes.string,
		subsSortOrder: PropTypes.oneOf( [ 'date-followed', 'alpha' ] ),
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
				recordTrack( 'calypso_reader_following_manage_search_performed', {
					query: newValue,
				} );
				recordAction( 'manage_feed_search' );
			}
			page.replace( searchUrl );
		}
	};

	handleSearchClosed = () => {
		this.scrollToTop();
		this.setState( { showMoreResults: false } );
		recordTrack( 'calypso_reader_following_manage_search_closed' );
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
		recordTrack( 'calypso_reader_following_manage_search_more_click' );
		recordAction( 'manage_feed_search_more' );
		page.replace(
			addQueryArgs( { showMoreResults: true }, window.location.pathname + window.location.search )
		);
	};

	reportFollowByUrlRender = () => {
		const siteUrl = this.props.readerAliasedFollowFeedUrl;
		const showingFollowByUrlButton = this.shouldShowFollowByUrl();

		if ( siteUrl && showingFollowByUrlButton ) {
			recordTrack( 'calypso_reader_following_manage_follow_by_url_render', {
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
			readerAliasedFollowFeedUrl,
		} = this.props;
		const searchPlaceholderText = translate( 'Search or enter URL to follow…' );
		const hasFollows = followsCount > 0;
		const showExistingSubscriptions = hasFollows && ! showMoreResults;
		const sitesQueryWithoutProtocol = withoutHttp( sitesQuery );
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
					<HeaderCake backHref={ '/read' }>
						<h1>{ translate( 'Manage Followed Sites' ) }</h1>
					</HeaderCake>
				</div>
				<ReaderMain className="following-manage">
					<DocumentHead title={ 'Manage Following' } />
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

						{ showFollowByUrl && (
							<div className="following-manage__url-follow">
								<FollowButton
									followLabel={ translate( 'Follow %s', {
										args: sitesQueryWithoutProtocol,
										comment: '%s is the name of the site being followed. For example: "Discover"',
									} ) }
									followingLabel={ translate( 'Following %s', {
										args: sitesQueryWithoutProtocol,
										comment: '%s is the name of the site being followed. For example: "Discover"',
									} ) }
									siteUrl={ addSchemeIfMissing( readerAliasedFollowFeedUrl, 'http' ) }
									followSource={ READER_FOLLOWING_MANAGE_URL_INPUT }
								/>
							</div>
						) }
					</div>
					{ ! sitesQuery && (
						<RecommendedSites
							sites={ take( filteredRecommendedSites, 2 ) }
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
					{ ! hasFollows && <FollowingManageEmptyContent /> }
				</ReaderMain>
			</Fragment>
		);
		/* eslint-enable jsx-a11y/no-autofocus */
	}
}

export default connect( ( state, { sitesQuery } ) => ( {
	searchResults: getReaderFeedsForQuery( state, {
		query: sitesQuery,
		excludeFollowed: true,
		sort: SORT_BY_RELEVANCE,
	} ),
	searchResultsCount: getReaderFeedsCountForQuery( state, {
		query: sitesQuery,
		excludeFollowed: true,
		sort: SORT_BY_RELEVANCE,
	} ),
	recommendedSites: getReaderRecommendedSites( state, recommendationsSeed ),
	recommendedSitesPagingOffset: getReaderRecommendedSitesPagingOffset( state, recommendationsSeed ),
	blockedSites: getBlockedSites( state ),
	dismissedSites: getDismissedSites( state ),
	readerAliasedFollowFeedUrl: sitesQuery && getReaderAliasedFollowFeedUrl( state, sitesQuery ),
	followsCount: getReaderFollowsCount( state ),
} ) )( localize( FollowingManage ) );
