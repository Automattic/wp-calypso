import PropTypes from 'prop-types';
import { Component } from 'react';
import { connect } from 'react-redux';
import { fetchStoredCards } from 'calypso/state/stored-cards/actions';
import { isFetchingStoredCards } from 'calypso/state/stored-cards/selectors';

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
