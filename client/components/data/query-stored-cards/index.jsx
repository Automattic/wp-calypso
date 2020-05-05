/**
 * External dependencies
 */

import PropTypes from 'prop-types';
import { Component } from 'react';
import { connect } from 'react-redux';

/**
 * Internal dependencies
 */
import { isFetchingStoredCards } from 'state/stored-cards/selectors';
import { fetchStoredCards } from 'state/stored-cards/actions';

class QueryStoredCards extends Component {
	UNSAFE_componentWillMount() {
		if ( ! this.props.isRequesting ) {
			this.props.fetchStoredCards();
		}
	}

	render() {
		return null;
	}
}

QueryStoredCards.propTypes = {
	fetchStoredCards: PropTypes.func.isRequired,
	isRequesting: PropTypes.bool.isRequired,
};

export default connect(
	( state ) => {
		return {
			isRequesting: isFetchingStoredCards( state ),
		};
	},
	{ fetchStoredCards }
)( QueryStoredCards );
