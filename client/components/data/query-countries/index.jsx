/**
 * External dependencies
 */
import PropTypes from 'prop-types';
import { Component } from 'react';

export default class QueryCountries extends Component {
	static propTypes = {
		requestCountries: PropTypes.func.isRequired,
	};

	componentDidMount() {
		this.props.requestCountries();
	}

	render() {
		return null;
	}
}
