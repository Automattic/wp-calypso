/**
 * External dependencies
 */
import PropTypes from 'prop-types';
import { Component } from 'react';
import { connect } from 'react-redux';

/**
 * Internal dependencies
 */
import { fetchStoredCards } from 'state/stored-cards/actions';
import { isFetchingStoredCards } from 'state/stored-cards/selectors';

class QueryStoredCards extends Component {
	componentWillMount() {
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
	isRequesting: PropTypes.bool.isRequired
};

export default connect(
	state => {
		return {
			isRequesting: isFetchingStoredCards( state )
		};
	},
	{ fetchStoredCards }
)( QueryStoredCards );
