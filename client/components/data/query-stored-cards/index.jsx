/**
 * External dependencies
 */
import { Component, PropTypes } from 'react';
import { connect } from 'react-redux';

/**
 * Internal dependencies
 */
import { isFetchingStoredCards } from 'state/stored-cards/selectors';
import { fetchStoredCards } from 'state/stored-cards/actions';

class QueryStoredCards extends Component {
	componentWillMount() {
		this.requestStoredCards();
	}

	componentWillReceiveProps( nextProps ) {
		this.requestStoredCards( nextProps );
	}

	requestStoredCards( props = this.props ) {
		if ( ! props.isRequesting ) {
			props.fetchStoredCards();
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
