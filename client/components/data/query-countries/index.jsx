/** @format */

/**
 * External dependencies
 */
import PropTypes from 'prop-types';
import { Component } from 'react';

export default class QueryCountries extends Component {
	static propTypes = {
		isRequesting: PropTypes.bool.isRequired,
		requestCountries: PropTypes.func.isRequired,
	};

	componentDidMount() {
		if ( ! this.props.isRequesting ) {
			this.props.requestCountries();
		}
	}

	render() {
		return null;
	}
}
