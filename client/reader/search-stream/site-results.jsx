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
import { getReaderFeedsForQuery } from 'state/selectors';
import QueryReaderFeedsSearch from 'components/data/query-reader-feeds-search';
import { requestFeedSearch } from 'state/reader/feed-searches/actions';
import ReaderInfiniteStream from 'components/reader-infinite-stream';
import { SORT_BY_RELEVANCE, SORT_BY_LAST_UPDATED } from 'state/reader/feed-searches/actions';
import { siteRowRenderer } from 'components/reader-infinite-stream/row-renderers';

const pickSort = sort => ( sort === 'date' ? SORT_BY_LAST_UPDATED : SORT_BY_RELEVANCE );

class SitesResults extends React.Component {
	static propTypes = {
		query: PropTypes.string,
		sort: PropTypes.oneOf( [ SORT_BY_LAST_UPDATED, SORT_BY_RELEVANCE ] ),
		requestFeedSearch: PropTypes.func,
		searchResults: PropTypes.array,
	};

	fetchNextPage = offset => {
		this.props.requestFeedSearch( {
			query: this.props.query,
			offset,
			excludeFollowed: false,
			sort: pickSort( this.props.sort ),
		} );
	};

	render() {
		const { query, searchResults } = this.props;

		return (
			<div>
				<QueryReaderFeedsSearch
					query={ query }
					excludeFollowed={ false }
					sort={ pickSort( this.props.sort ) }
				/>
				<ReaderInfiniteStream
					items={ searchResults || [ {}, {}, {}, {}, {} ] }
					showLastUpdatedDate={ false }
					fetchNextPage={ this.fetchNextPage }
					rowRenderer={ siteRowRenderer }
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
	} ),
	{ requestFeedSearch },
)( localize( SitesResults ) );
