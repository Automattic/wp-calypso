/**
 * External dependencies
 */
import { Component, PropTypes } from 'react';
import { connect } from 'react-redux';

/**
 * Internal dependencies
 */
import { requestFeedSearch } from 'state/reader/feed-search/actions';

class QueryFeedSearch extends Component {
	componentWillMount() {
		const { searchFeeds, query } = this.props;
		searchFeeds( query );
	}

	render() {
		return null;
	}
}

QueryFeedSearch.propTypes = {
	query: PropTypes.string,
	searchFeeds: PropTypes.func,
};

export default connect( null, { requestFeedSearch } )( QueryFeedSearch );
