/**
 * External dependencies
 */

import PropTypes from 'prop-types';
import { Component } from 'react';
import { connect } from 'react-redux';

/**
 * Internal dependencies
 */
import { requestUserDevices } from 'calypso/state/user-devices/actions';

class QueryUserDevices extends Component {
	static propTypes = {
		requestUserDevices: PropTypes.func,
	};

	componentDidMount() {
		this.props.requestUserDevices();
	}

	render() {
		return null;
	}
}

export default connect( null, { requestUserDevices } )( QueryUserDevices );
