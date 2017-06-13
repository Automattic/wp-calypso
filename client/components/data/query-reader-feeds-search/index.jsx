/**
 * External dependencies
 */
import { Component, PropTypes } from 'react';
import { connect } from 'react-redux';

/**
 * Internal dependencies
 */
import { requestFeedSearch } from 'state/reader/feed-searches/actions';

class QueryFeedSearch extends Component {
	static propTypes = {
		query: PropTypes.string,
		excludeFollowed: PropTypes.bool,
		searchFeeds: PropTypes.func,
	};

	componentWillMount() {
		this.props.requestFeedSearch( {
			query: this.props.query,
			excludeFollowed: this.props.excludeFollowed,
		} );
	}

	componentWillReceiveProps( nextProps ) {
		nextProps.requestFeedSearch( {
			query: nextProps.query,
			excludeFollowed: nextProps.excludeFollowed,
		} );
	}

	render() {
		return null;
	}
}

export default connect( null, { requestFeedSearch } )( QueryFeedSearch );
