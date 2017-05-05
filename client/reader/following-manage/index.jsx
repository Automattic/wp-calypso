/**
 * External Dependencies
 */
import React, { Component, PropTypes } from 'react';
import { connect } from 'react-redux';
import { trim, debounce } from 'lodash';
import { localize } from 'i18n-calypso';
import page from 'page';
import qs from 'qs';
import url from 'url';

/**
 * Internal Dependencies
 */
import CompactCard from 'components/card/compact';
import DocumentHead from 'components/data/document-head';
import SearchInput from 'components/search';
import ReaderMain from 'components/reader-main';
import { getReaderFeedsForQuery, getReaderFeedsCountForQuery } from 'state/selectors';
import QueryReaderFeedsSearch from 'components/data/query-reader-feeds-search';
import FollowingManageSubscriptions from './subscriptions';
import FollowingManageSearchFeedsResults from './feed-search-results';
import MobileBackToSidebar from 'components/mobile-back-to-sidebar';
import { requestFeedSearch } from 'state/reader/feed-searches/actions';
import { addQueryArgs } from 'lib/url';
import FollowButton from 'reader/follow-button';
import { READER_FOLLOWING_MANAGE_URL_INPUT } from 'reader/follow-button/follow-sources';

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
		forceRefresh: false,
		subsSortOrder: 'date-followed',
	}

	state = {
		width: 800,
		forceRefresh: false,
	};

	// TODO make this common between our different search pages?
	updateQuery = ( newValue ) => {
		this.scrollToTop();
		const trimmedValue = trim( newValue ).substring( 0, 1024 );
		if ( ( trimmedValue !== '' &&
				trimmedValue.length > 1 &&
				trimmedValue !== this.props.query
			) ||
			newValue === ''
		) {
			let searchUrl = '/following/manage';
			if ( newValue ) {
				searchUrl += '?' + qs.stringify( { q: newValue } );
			}
			page.replace( searchUrl );
		}
	}

	handleSearchClosed = () => {
		this.scrollToTop();
		this.setState( { showMoreResults: false } );
	}

	scrollToTop = () => {
		window.scrollTo( 0, 0 );
	}

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
	}

	componentDidMount() {
		this.resizeListener = window.addEventListener(
			'resize',
			debounce( this.resizeSearchBox, 50 )
		);
		this.resizeSearchBox();

		// this is a total hack. In React-Virtualized you need to tell a WindowScroller when the things
		// above it has moved with a call to updatePosision().  Our issue is we don't have a good moment
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

	componentWillReceiveProps( nextProps ) {
		const forceRefresh = nextProps.sitesQuery !== this.props.sitesQuery;
		this.setState( { forceRefresh } );
	}

	fetchNextPage = offset => this.props.requestFeedSearch( this.props.sitesQuery, offset );

	handleShowMoreClicked = () => {
		page.replace( addQueryArgs( { showMoreResults: true }, window.location.pathname + window.location.search ) );
	}

	isUrl( sitesQuery ) {
		let parsedUrl = url.parse( sitesQuery );

		// Make sure the query has a protocol - hostname ends up blank otherwise
		if ( ! parsedUrl.protocol ) {
			parsedUrl = url.parse( 'http://' + sitesQuery );
		}

		if ( ! parsedUrl.hostname || parsedUrl.hostname.indexOf( '.' ) === -1 ) {
			return false;
		}

		// Check for a valid-looking TLD
		if ( parsedUrl.hostname.lastIndexOf( '.' ) > ( parsedUrl.hostname.length - 3 ) ) {
			return false;
		}

		// Make sure the hostname has at least two parts separated by a dot
		const hostnameParts = parsedUrl.hostname.split( '.' ).filter( Boolean );
		if ( hostnameParts.length < 2 ) {
			return false;
		}

		return true;
	}

	render() {
		const {
			sitesQuery,
			subsQuery,
			subsSortOrder,
			translate,
			searchResults,
			searchResultsCount,
			showMoreResults
		} = this.props;
		const searchPlaceholderText = translate( 'Search millions of sites' );
		const showExistingSubscriptions = ! ( !! sitesQuery && showMoreResults );
		const isSitesQueryUrl = this.isUrl( sitesQuery );

		return (
			<ReaderMain className="following-manage">
				<DocumentHead title={ 'Manage Following' } />
				<MobileBackToSidebar>
					<h1>{ translate( 'Manage Followed Sites' ) }</h1>
				</MobileBackToSidebar>
				{ ! searchResults && ! isSitesQueryUrl && <QueryReaderFeedsSearch query={ sitesQuery } /> }
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
							value={ sitesQuery }>
						</SearchInput>
					</CompactCard>

					{ isSitesQueryUrl && (
						<div className="following-manage__url-follow">
							<FollowButton
								followLabel={ translate( 'Follow %s', { args: sitesQuery } ) }
								siteUrl={ sitesQuery }
								followSource={ READER_FOLLOWING_MANAGE_URL_INPUT } />
						</div>
					) }
				</div>
				{ !! sitesQuery && ! isSitesQueryUrl && (
					<FollowingManageSearchFeedsResults
						searchResults={ searchResults }
						showMoreResults={ showMoreResults }
						showMoreResultsClicked={ this.handleShowMoreClicked }
						width={ this.state.width }
						fetchNextPage={ this.fetchNextPage }
						forceRefresh={ this.state.forceRefresh }
						searchResultsCount={ searchResultsCount }
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
			</ReaderMain>
		);
	}
}

export default connect(
	( state, ownProps ) => ( {
		searchResults: getReaderFeedsForQuery( state, ownProps.sitesQuery ),
		searchResultsCount: getReaderFeedsCountForQuery( state, ownProps.sitesQuery ),
	} ),
	{ requestFeedSearch }
)( localize( FollowingManage ) );
