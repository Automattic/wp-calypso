/** @format */

/**
 * External dependencies
 */
import { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';

/**
 * Internal dependencies
 */
import config from 'config';
import { getHappychatAuth } from 'state/happychat/utils';
import isHappychatConnectionUninitialized from 'state/happychat/selectors/is-happychat-connection-uninitialized';
import { initConnection } from 'state/happychat/connection/actions';

export class HappychatConnection extends Component {
	componentDidMount() {
		if ( this.props.isHappychatEnabled && this.props.isConnectionUninitialized ) {
			this.props.initConnection( this.props.getAuth() );
		}
	}

	render() {
		return null;
	}
}

HappychatConnection.propTypes = {
	getAuth: PropTypes.func,
	isConnectionUninitialized: PropTypes.bool,
	isHappychatEnabled: PropTypes.bool,
	initConnection: PropTypes.func,
};

export default connect(
	state => ( {
		getAuth: getHappychatAuth( state ),
		isConnectionUninitialized: isHappychatConnectionUninitialized( state ),
		isHappychatEnabled: config.isEnabled( 'happychat' ),
	} ),
	{ initConnection }
)( HappychatConnection );
