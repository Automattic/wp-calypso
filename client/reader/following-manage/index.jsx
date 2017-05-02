/**
 * External Dependencies
 */
import React, { Component, PropTypes } from 'react';
import { connect } from 'react-redux';
import { trim, debounce } from 'lodash';
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
import { getReaderFeedsForQuery } from 'state/selectors';
import QueryReaderFeedsSearch from 'components/data/query-reader-feeds-search';
import FollowingManageSubscriptions from './subscriptions';
import FollowingManageSearchFeedsResults from './feed-search-results';
import MobileBackToSidebar from 'components/mobile-back-to-sidebar';
import { requestFeedSearch } from 'state/reader/feed-searches/actions';
import { addQueryArgs } from 'lib/url';

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

	handleStreamMounted = ( ref ) => {
		this.streamRef = ref;
	}

	handleSearchBoxMounted = ( ref ) => {
		this.searchBoxRef = ref;
	}

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
	}

	componentWillUnmount() {
		window.removeEventListener( 'resize', this.resizeListener );
	}

	componentWillReceiveProps( nextProps ) {
		const forceRefresh = nextProps.sitesQuery !== this.props.sitesQuery;
		this.setState( { forceRefresh } );
	}

	fetchNextPage = offset => this.props.requestFeedSearch( this.props.sitesQuery, offset );

	handleShowMoreClicked = () => {
		page.replace( addQueryArgs( { showMoreResults: true }, window.location.pathname + window.location.search ) );
	}

	render() {
		const { sitesQuery, subsQuery, subsSortOrder, translate, searchResults, showMoreResults } = this.props;
		const searchPlaceholderText = translate( 'Search millions of sites' );

		return (
			<ReaderMain className="following-manage">
				<DocumentHead title={ 'Manage Following' } />
				<MobileBackToSidebar>
					<h1>{ translate( 'Manage Followed Sites' ) }</h1>
				</MobileBackToSidebar>
				{ ! searchResults && <QueryReaderFeedsSearch query={ sitesQuery } /> }
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
				</div>
				{ !! sitesQuery && (
					<FollowingManageSearchFeedsResults
						searchResults={ searchResults }
						showMoreResults={ showMoreResults }
						showMoreResultsClicked={ this.handleShowMoreClicked }
						width={ this.state.width }
						fetchNextPage={ this.fetchNextPage }
						forceRefresh={ this.state.forceRefresh }
					/>
				) }
				{ ! ( !! sitesQuery && this.state.showMoreResults ) && (
					<FollowingManageSubscriptions
						width={ this.state.width }
						query={ subsQuery }
						sortOrder={ subsSortOrder }
					/>
				) }
			</ReaderMain>
		);
	}
}

export default connect(
	( state, ownProps ) => ( {
		searchResults: getReaderFeedsForQuery( state, ownProps.sitesQuery ),
	} ),
	{ requestFeedSearch }
)( localize( FollowingManage ) );
