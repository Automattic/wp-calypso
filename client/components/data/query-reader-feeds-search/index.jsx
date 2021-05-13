/**
 * External dependencies
 */

import PropTypes from 'prop-types';
import { Component } from 'react';
import { connect } from 'react-redux';

/**
 * Internal dependencies
 */
import {
	requestFeedSearch,
	SORT_BY_LAST_UPDATED,
	SORT_BY_RELEVANCE,
} from 'calypso/state/reader/feed-searches/actions';

class QueryFeedSearch extends Component {
	static propTypes = {
		query: PropTypes.string,
		excludeFollowed: PropTypes.bool,
		sort: PropTypes.oneOf( [ SORT_BY_LAST_UPDATED, SORT_BY_RELEVANCE ] ),
	};

	UNSAFE_componentWillMount() {
		this.props.requestFeedSearch( {
			query: this.props.query,
			excludeFollowed: this.props.excludeFollowed,
			sort: this.props.sort,
		} );
	}

	UNSAFE_componentWillReceiveProps( nextProps ) {
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
