/** @format */

/**
 * External dependencies
 */
import { Component } from 'react';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';

/**
 * Internal dependencies
 */
import { requestVerticals } from 'state/signup/verticals/actions';
import { getVerticals } from 'state/signup/verticals/selectors';

class QueryVerticals extends Component {
	static propTypes = {
		searchTerm: PropTypes.string.isRequired,
		limit: PropTypes.number,
	};

	static defaultProps = {
		limit: 7,
	};

	componentDidMount() {
		const { isFetched, searchTerm } = this.props;

		if ( ! isFetched ) {
			this.props.requestVerticals( searchTerm );
		}
	}

	render() {
		return null;
	}
}

export default connect(
	( state, ownProps ) => ( {
		isFetched: getVerticals( ownProps.searchTerm ),
	} ),
	{
		requestVerticals,
	}
)( QueryVerticals );
