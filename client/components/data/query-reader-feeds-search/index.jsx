/**
 * External dependencies
 */
import { Component, PropTypes } from 'react';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';

/**
 * Internal dependencies
 */
import { isRequestingFeedSearch } from 'state/reader/feed-search/selectors';
import { requestFeedSearch } from 'state/reader/feed-search/actions';

class QueryFeedSearch extends Component {
	componentWillMount() {
		if ( this.props.shouldSearchFeeds ) {
			this.props.requestFeedSearch( this.props.query );
		}
	}

	componentWillReceiveProps( nextProps ) {
		if ( ! nextProps.shouldSearchFeeds || ( this.props.query === nextProps.query ) ) {
			return;
		}

		nextProps.requestFeedSearch( nextProps.query );
	}

	render() {
		return null;
	}
}

QueryFeedSearch.propTypes = {
	query: PropTypes.string,
	shouldSearchFeeds: PropTypes.bool,
	requestFeedSearch: PropTypes.func,
};

export default connect(
	( state, ownProps ) => (
		{
			shouldSearchFeeds: ! isRequestingFeedSearch( state, ownProps.query )
		}
	),
	( dispatch ) => (
		bindActionCreators( {
			requestFeedSearch
		}, dispatch )
	)
)( QueryFeedSearch );
