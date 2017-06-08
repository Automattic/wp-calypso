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

class SitesResults extends React.Component {
	static propTypes = {
		query: PropTypes.string,
		requestFeedSearch: PropTypes.func,
		searchResults: PropTypes.array,
	};

	fetchNextPage = offset => {
		this.props.requestFeedSearch( this.props.query, offset );
	};

	render() {
		const { query, searchResults } = this.props;

		return (
			<div>
				<QueryReaderFeedsSearch query={ query } />
				<ReaderInfiniteStream
					itemType={ 'site' }
					items={ searchResults || [ {}, {}, {}, {}, {} ] }
					showLastUpdatedDate={ false }
					fetchNextPage={ this.fetchNextPage }
					forceRefresh={ searchResults }
				/>
			</div>
		);
	}
}

export default connect(
	( state, ownProps ) => ( {
		searchResults: getReaderFeedsForQuery( state, ownProps.query ),
	} ),
	{ requestFeedSearch }
)( localize( SitesResults ) );
