/**
 * External Dependencies
 */
import PropTypes from 'prop-types';
import React from 'react';
import { localize } from 'i18n-calypso';
import { connect } from 'react-redux';

/**
 * Internal Dependencies
 */
import {
	getReaderFeedsForQuery,
	getReaderFeedsCountForQuery,
} from 'state/reader/feed-searches/selectors';
import QueryReaderFeedsSearch from 'components/data/query-reader-feeds-search';
import ReaderInfiniteStream from 'reader/components/reader-infinite-stream';
import {
	requestFeedSearch,
	SORT_BY_RELEVANCE,
	SORT_BY_LAST_UPDATED,
} from 'state/reader/feed-searches/actions';
import { SEARCH_RESULTS_SITES } from 'reader/follow-sources';
import { siteRowRenderer } from 'reader/components/reader-infinite-stream/row-renderers';
import withDimensions from 'lib/with-dimensions';

class SiteResults extends React.Component {
	static propTypes = {
		query: PropTypes.string,
		sort: PropTypes.oneOf( [ SORT_BY_LAST_UPDATED, SORT_BY_RELEVANCE ] ),
		requestFeedSearch: PropTypes.func,
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
	( state, ownProps ) => ( {
		searchResults: getReaderFeedsForQuery( state, {
			query: ownProps.query,
			excludeFollowed: false,
			sort: ownProps.sort,
		} ),
		searchResultsCount: getReaderFeedsCountForQuery( state, {
			query: ownProps.query,
			excludeFollowed: false,
			sort: ownProps.sort,
		} ),
	} ),
	{ requestFeedSearch }
)( localize( withDimensions( SiteResults ) ) );
