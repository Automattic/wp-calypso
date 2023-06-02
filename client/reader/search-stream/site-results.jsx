import { localize } from 'i18n-calypso';
import PropTypes from 'prop-types';
import { Component } from 'react';
import { connect } from 'react-redux';
import QueryReaderFeedsSearch from 'calypso/components/data/query-reader-feeds-search';
import withDimensions from 'calypso/lib/with-dimensions';
import ReaderInfiniteStream from 'calypso/reader/components/reader-infinite-stream';
import { siteRowRenderer } from 'calypso/reader/components/reader-infinite-stream/row-renderers';
import { SEARCH_RESULTS_SITES } from 'calypso/reader/follow-sources';
import {
	requestFeedSearch,
	SORT_BY_RELEVANCE,
	SORT_BY_LAST_UPDATED,
} from 'calypso/state/reader/feed-searches/actions';
import {
	getReaderFeedsForQuery,
	getReaderFeedsCountForQuery,
} from 'calypso/state/reader/feed-searches/selectors';
import { getFeed } from 'calypso/state/reader/feeds/selectors';

class SiteResults extends Component {
	static propTypes = {
		query: PropTypes.string,
		sort: PropTypes.oneOf( [ SORT_BY_LAST_UPDATED, SORT_BY_RELEVANCE ] ),
		requestFeedSearch: PropTypes.func,
		onReceiveSearchResults: PropTypes.func,
		searchResults: PropTypes.array,
		searchResultsCount: PropTypes.number,
		width: PropTypes.number.isRequired,
		showLastUpdatedDate: PropTypes.bool,
	};

	fetchNextPage = ( offset ) => {
		this.props.requestFeedSearch( {
			query: this.props.query,
			offset,
			excludeFollowed: false,
			sort: this.props.sort,
		} );
	};

	hasNextPage = ( offset ) => offset < this.props.searchResultsCount;

	render() {
		const { query, searchResults, width, sort, showLastUpdatedDate } = this.props;
		const isEmpty = query?.length > 0 && searchResults?.length === 0;

		if ( isEmpty ) {
			return (
				<div className="search-stream__site-results-none">
					{ this.props.translate( 'No sites found.' ) }
				</div>
			);
		}

		return (
			<div>
				<QueryReaderFeedsSearch query={ query } excludeFollowed={ false } sort={ sort } />
				<ReaderInfiniteStream
					items={ searchResults || [ {}, {}, {}, {}, {} ] }
					width={ width }
					fetchNextPage={ this.fetchNextPage }
					hasNextPage={ this.hasNextPage }
					rowRenderer={ siteRowRenderer }
					extraRenderItemProps={ {
						showLastUpdatedDate,
						followSource: SEARCH_RESULTS_SITES,
					} }
				/>
			</div>
		);
	}
}

export default connect(
	( state, ownProps ) => {
		const searchResults = getReaderFeedsForQuery( state, {
			query: ownProps.query,
			excludeFollowed: false,
			sort: ownProps.sort,
		} );

		// Check if searchResults has one item and if it has a feed_ID
		if ( searchResults && searchResults.length === 1 ) {
			let feed = searchResults[ 0 ];
			if ( feed.feed_ID.length > 0 ) {
				// If it has a feed_id, get the feed object from the state
				feed = getFeed( state, feed.feed_ID );
			}
			ownProps.onReceiveSearchResults( feed );
		}
		return {
			searchResults: searchResults,
			searchResultsCount: getReaderFeedsCountForQuery( state, {
				query: ownProps.query,
				excludeFollowed: false,
				sort: ownProps.sort,
			} ),
		};
	},
	{ requestFeedSearch }
)( localize( withDimensions( SiteResults ) ) );
