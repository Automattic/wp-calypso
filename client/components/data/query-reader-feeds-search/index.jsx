/** @format */
/**
 * External dependencies
 */
import { Component, PropTypes } from 'react';
import { connect } from 'react-redux';

/**
 * Internal dependencies
 */
import {
	requestFeedSearch,
	SORT_BY_LAST_UPDATED,
	SORT_BY_RELEVANCE,
} from 'state/reader/feed-searches/actions';

class QueryFeedSearch extends Component {
	static propTypes = {
		query: PropTypes.string,
		excludeFollowed: PropTypes.bool,
		sort: PropTypes.oneOf( [ SORT_BY_LAST_UPDATED, SORT_BY_RELEVANCE ] ),
	};

	componentWillMount() {
		this.props.requestFeedSearch( {
			query: this.props.query,
			excludeFollowed: this.props.excludeFollowed,
			sort: this.props.sort,
		} );
	}

	componentWillReceiveProps( nextProps ) {
		nextProps.requestFeedSearch( {
			query: nextProps.query,
			excludeFollowed: nextProps.excludeFollowed,
			sort: nextProps.sort,
		} );
	}

	render() {
		return null;
	}
}

export default connect( null, { requestFeedSearch } )( QueryFeedSearch );
