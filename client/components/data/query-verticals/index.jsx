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

export class QueryVerticals extends Component {
	static propTypes = {
		searchTerm: PropTypes.string,
		limit: PropTypes.number,
	};

	static defaultProps = {
		limit: 7,
		searchTerm: '',
	};

	componentDidMount() {
		const { searchTerm, limit } = this.props;
		const trimmedSearchTerm = searchTerm.trim();

		if ( trimmedSearchTerm ) {
			this.props.requestVerticals( trimmedSearchTerm, limit );
		}
	}

	componentDidUpdate() {
		const { isFetched, searchTerm, limit } = this.props;
		const trimmedSearchTerm = searchTerm.trim();

		if ( ! isFetched && trimmedSearchTerm ) {
			this.props.requestVerticals( trimmedSearchTerm, limit );
		}
	}

	render() {
		return null;
	}
}

export default connect(
	( state, ownProps ) => ( {
		isFetched: null !== getVerticals( ownProps.searchTerm ),
	} ),
	{
		requestVerticals,
	}
)( QueryVerticals );
