/**
 * External Dependencies
 */
import React, { Component, PropTypes } from 'react';
import { connect } from 'react-redux';
import { trim, debounce, random, take, reject, includes } from 'lodash';
import { localize } from 'i18n-calypso';
import page from 'page';
import qs from 'qs';

/**
 * Internal Dependencies
 */
import CompactCard from 'components/card/compact';
import DocumentHead from 'components/data/document-head';
import SearchInput from 'components/search';
import ReaderMain from 'components/reader-main';
import {
	getReaderFeedsForQuery,
	getReaderFeedsCountForQuery,
	getReaderRecommendedSites,
	getReaderRecommendedSitesPagingOffset,
	getBlockedSites,
	getReaderAliasedFollowFeedUrl,
} from 'state/selectors';
import QueryReaderFeedsSearch from 'components/data/query-reader-feeds-search';
import QueryReaderRecommendedSites from 'components/data/query-reader-recommended-sites';
import RecommendedSites from 'blocks/reader-recommended-sites';
import FollowingManageSubscriptions from './subscriptions';
import FollowingManageSearchFeedsResults from './feed-search-results';
import FollowingManageEmptyContent from './empty';
import MobileBackToSidebar from 'components/mobile-back-to-sidebar';
import { requestFeedSearch } from 'state/reader/feed-searches/actions';
import { addQueryArgs } from 'lib/url';
import FollowButton from 'reader/follow-button';
import {
	READER_FOLLOWING_MANAGE_URL_INPUT,
	READER_FOLLOWING_MANAGE_RECOMMENDATION,
} from 'reader/follow-button/follow-sources';
import { resemblesUrl, addSchemeIfMissing, withoutHttp } from 'lib/url';
import { getReaderFollowsCount } from 'state/selectors';

const PAGE_SIZE = 4;
let RECS_SEED = random( 0, 10000 );

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

	componentWillUnmount() {
		RECS_SEED = random( 0, 1000 );
	}

	// TODO make this common between our different search pages?
	updateQuery = newValue => {
		this.scrollToTop();
		const trimmedValue = trim( newValue ).substring( 0, 1024 );
		if (
			( trimmedValue !== '' && trimmedValue.length > 1 && trimmedValue !== this.props.query ) ||
			newValue === ''
		) {
			let searchUrl = '/following/manage';
			if ( newValue ) {
				searchUrl += '?' + qs.stringify( { q: newValue } );
			}
			page.replace( searchUrl );
		}
	};

	handleSearchClosed = () => {
		this.scrollToTop();
		this.setState( { showMoreResults: false } );
	};

	scrollToTop = () => {
		window.scrollTo( 0, 0 );
	};

	handleStreamMounted = ref => this.streamRef = ref;
	handleSearchBoxMounted = ref => this.searchBoxRef = ref;
	handleWindowScrollerMounted = ref => this.windowScrollerRef = ref;

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
	}

	componentWillUnmount() {
		window.removeEventListener( 'resize', this.resizeListener );
		clearInterval( this.windowScrollerRef );
	}

	shouldRequestMoreRecs = () => {
		const { recommendedSites, blockedSites } = this.props;

		return reject( recommendedSites, site => includes( blockedSites, site.blogId ) ).length <= 4;
	};

	fetchNextPage = offset => this.props.requestFeedSearch( this.props.sitesQuery, offset );

	handleShowMoreClicked = () => {
		page.replace(
			addQueryArgs( { showMoreResults: true }, window.location.pathname + window.location.search )
		);
	};

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
			followsCount,
		} = this.props;
		const searchPlaceholderText = translate( 'Search or enter URL to follow…' );
		const hasFollows = followsCount > 0;
		const showExistingSubscriptions = hasFollows && ! showMoreResults;
		const isSitesQueryUrl = resemblesUrl( sitesQuery );
		let sitesQueryWithoutProtocol;
		if ( isSitesQueryUrl ) {
			sitesQueryWithoutProtocol = withoutHttp( sitesQuery );
		}
		const filteredRecommendedSites = reject(
			recommendedSites,
			site => includes( blockedSites, site.blogId )
		);
		const isFollowByUrlWithNoSearchResults = isSitesQueryUrl && searchResultsCount === 0;

		return (
			<ReaderMain className="following-manage">
				<DocumentHead title={ 'Manage Following' } />
				<MobileBackToSidebar>
					<h1>{ translate( 'Streams' ) }</h1>
				</MobileBackToSidebar>
				{ ! searchResults && <QueryReaderFeedsSearch query={ sitesQuery } /> }
				{ this.shouldRequestMoreRecs() &&
					<QueryReaderRecommendedSites
						seed={ RECS_SEED }
						offset={ recommendedSitesPagingOffset + PAGE_SIZE || 0 }
					/> }
				<h2 className="following-manage__header">{ translate( 'Follow Something New' ) }</h2>
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
						/>
					</CompactCard>

					{ isSitesQueryUrl &&
						<div className="following-manage__url-follow">
							{ isFollowByUrlWithNoSearchResults &&
								<span className="following-manage__url-follow-no-search-results-message">
									{ translate(
										'Sorry, no sites that we could find match {{italic}}%(site1)s{{/italic}}. ' +
											'Try to follow {{italic}}%(site2)s{{/italic}} anyway?',
										{
											components: { italic: <i /> },
											args: { site1: sitesQuery, site2: sitesQuery },
										}
									) }
								</span> }
							<FollowButton
								followLabel={ translate( 'Follow %s', { args: sitesQueryWithoutProtocol } ) }
								followingLabel={ translate( 'Following %s', { args: sitesQueryWithoutProtocol } ) }
								siteUrl={ this.props.readerAliasedFollowFeedUrl }
								followSource={ READER_FOLLOWING_MANAGE_URL_INPUT }
							/>
						</div> }
				</div>
				{ hasFollows &&
					! sitesQuery &&
					<RecommendedSites
						sites={ take( filteredRecommendedSites, 2 ) }
						followSource={ READER_FOLLOWING_MANAGE_RECOMMENDATION }
					/> }
				{ !! sitesQuery &&
					! isFollowByUrlWithNoSearchResults &&
					<FollowingManageSearchFeedsResults
						searchResults={ searchResults }
						showMoreResults={ showMoreResults }
						showMoreResultsClicked={ this.handleShowMoreClicked }
						width={ this.state.width }
						fetchNextPage={ this.fetchNextPage }
						forceRefresh={ this.props.sitesQuery }
						searchResultsCount={ searchResultsCount }
						query={ sitesQuery }
					/> }
				{ showExistingSubscriptions &&
					<FollowingManageSubscriptions
						width={ this.state.width }
						query={ subsQuery }
						sortOrder={ subsSortOrder }
						windowScrollerRef={ this.handleWindowScrollerMounted }
					/> }
				{ ! hasFollows && <FollowingManageEmptyContent /> }
			</ReaderMain>
		);
	}
}

export default connect(
	( state, ownProps ) => ( {
		searchResults: getReaderFeedsForQuery( state, ownProps.sitesQuery ),
		searchResultsCount: getReaderFeedsCountForQuery( state, ownProps.sitesQuery ),
		recommendedSites: getReaderRecommendedSites( state, RECS_SEED ),
		recommendedSitesPagingOffset: getReaderRecommendedSitesPagingOffset( state, RECS_SEED ),
		blockedSites: getBlockedSites( state ),
		readerAliasedFollowFeedUrl: getReaderAliasedFollowFeedUrl(
			state,
			addSchemeIfMissing( ownProps.sitesQuery, 'http' )
		),
		followsCount: getReaderFollowsCount( state ),
	} ),
	{ requestFeedSearch }
)( localize( FollowingManage ) );
