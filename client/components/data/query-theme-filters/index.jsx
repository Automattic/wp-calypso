/** @format */
/**
 * External dependencies
 */
import { Component, PropTypes } from 'react';
import { connect } from 'react-redux';

/**
 * Internal dependencies
 */
import { requestThemeFilters } from 'state/themes/actions';

export class QueryThemeFilters extends Component {
	static propTypes = {
		requestThemeFilters: PropTypes.func.isRequired,
	};

	componentDidMount() {
		this.props.requestThemeFilters();
	}

	render() {
		return null;
	}
}

export default connect( null, { requestThemeFilters } )( QueryThemeFilters );
