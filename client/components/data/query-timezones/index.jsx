/**
 * External dependencies
 */

import PropTypes from 'prop-types';
import { Component } from 'react';
import { connect } from 'react-redux';

/**
 * Internal dependencies
 */
import { requestTimezones } from 'calypso/state/timezones/actions';

export class QueryTimezones extends Component {
	static propTypes = {
		requestTimezones: PropTypes.func,
	};

	componentDidMount() {
		this.props.requestTimezones();
	}

	render() {
		return null;
	}
}

export default connect( null, { requestTimezones } )( QueryTimezones );
