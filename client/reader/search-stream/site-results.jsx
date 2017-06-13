/**
 * External Dependencies
 */
import React, { PropTypes } from 'react';
import 'lodash';
import { localize } from 'i18n-calypso';
import { connect } from 'react-redux';

/**
 * Internal Dependencies
 */
import { getReaderFeedsCountForQuery, getReaderFeedsForQuery } from 'state/selectors';
import QueryReaderFeedsSearch from 'components/data/query-reader-feeds-search';
import { requestFeedSearch } from 'state/reader/feed-searches/actions';
import ReaderInfiniteStream from 'components/reader-infinite-stream';
import { SORT_BY_RELEVANCE, SORT_BY_LAST_UPDATED } from 'state/reader/feed-searches/actions';
import { siteRowRenderer } from 'components/reader-infinite-stream/row-renderers';
import withWidth from 'lib/with-width';

const pickSort = sort => ( sort === 'date' ? SORT_BY_LAST_UPDATED : SORT_BY_RELEVANCE );

class SiteResults extends React.Component {
	static propTypes = {
		query: PropTypes.string,
		sort: PropTypes.oneOf( [ SORT_BY_LAST_UPDATED, SORT_BY_RELEVANCE ] ),
		requestFeedSearch: PropTypes.func,
		searchResults: PropTypes.array,
		searchResultsCount: PropTypes.number,
		width: PropTypes.number.isRequired,
	};

	fetchNextPage = offset => {
		this.props.requestFeedSearch( {
			query: this.props.query,
			offset,
			excludeFollowed: false,
			sort: pickSort( this.props.sort ),
		} );
	};

	hasNextPage = offset => offset < this.props.searchResultsCount;

	render() {
		const { query, searchResults, width } = this.props;

		return (
			<div>
				<QueryReaderFeedsSearch
					query={ query }
					excludeFollowed={ false }
					sort={ pickSort( this.props.sort ) }
				/>
				<ReaderInfiniteStream
					items={ searchResults || [ {}, {}, {}, {}, {} ] }
					width={ width }
					showLastUpdatedDate={ false }
					fetchNextPage={ this.fetchNextPage }
					hasNextPage={ this.hasNextPage }
					rowRenderer={ siteRowRenderer }
					renderEventName={ 'search_stream_sites' }
				/>
			</div>
		);
	}
}

export default connect(
	( state, ownProps ) => ( {
		searchResults: getReaderFeedsForQuery(
			state,
			{ query: ownProps.query, excludeFollowed: false, sort: pickSort( ownProps.sort ) },
		),
		searchResultsCount: getReaderFeedsCountForQuery(
			state,
			{ query: ownProps.query, excludeFollowed: false, sort: pickSort( ownProps.sort ) },
		),
	} ),
	{ requestFeedSearch },
)( localize( withWidth( SiteResults ) ) );
