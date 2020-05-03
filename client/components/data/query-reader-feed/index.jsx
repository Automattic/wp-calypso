/**
 * External dependencies
 */

import PropTypes from 'prop-types';
import { Component } from 'react';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';

/**
 * Internal dependencies
 */
import { shouldFeedBeFetched } from 'state/reader/feeds/selectors';
import { requestFeed } from 'state/reader/feeds/actions';

class QueryReaderFeed extends Component {
	UNSAFE_componentWillMount() {
		if ( this.props.shouldFeedBeFetched ) {
			this.props.requestFeed( this.props.feedId );
		}
	}

	UNSAFE_componentWillReceiveProps( nextProps ) {
		if ( ! nextProps.shouldFeedBeFetched || this.props.feedId === nextProps.feedId ) {
			return;
		}

		nextProps.requestFeed( nextProps.feedId );
	}

	render() {
		return null;
	}
}

QueryReaderFeed.propTypes = {
	feedId: PropTypes.number,
	shouldFeedBeFetched: PropTypes.bool,
	requestFeed: PropTypes.func,
};

QueryReaderFeed.defaultProps = {
	requestFeed: () => {},
};

export default connect(
	( state, ownProps ) => {
		const { feedId } = ownProps;
		return {
			shouldFeedBeFetched: shouldFeedBeFetched( state, feedId ),
		};
	},
	( dispatch ) => {
		return bindActionCreators(
			{
				requestFeed,
			},
			dispatch
		);
	}
)( QueryReaderFeed );
