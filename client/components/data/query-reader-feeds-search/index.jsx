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
		searchFeeds: PropTypes.func,
	}

	componentWillMount() {
		this.props.requestFeedSearch( this.props.query );
	}

	componentWillReceiveProps( nextProps ) {
		nextProps.requestFeedSearch( nextProps.query );
	}

	render() {
		return null;
	}
}

export default connect( null, { requestFeedSearch } )( QueryFeedSearch );
