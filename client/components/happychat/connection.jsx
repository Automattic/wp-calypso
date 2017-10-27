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
import { initConnection } from 'state/happychat/connection/actions';
import getHappychatConfig from 'state/happychat/selectors/get-happychat-config';
import isHappychatConnectionUninitialized from 'state/happychat/selectors/is-happychat-connection-uninitialized';

export class HappychatConnection extends Component {
	componentDidMount() {
		if ( this.props.isEnabled && this.props.isUninitialized ) {
			this.props.initConnection( this.props.getConfig() );
		}
	}

	render() {
		return null;
	}
}

HappychatConnection.propTypes = {
	isEnabled: PropTypes.bool,
	isUninitialized: PropTypes.bool,
	initConnection: PropTypes.func,
};

export default connect(
	state => ( {
		isEnabled: config.isEnabled( 'happychat' ),
		isUninitialized: isHappychatConnectionUninitialized( state ),
		getConfig: getHappychatConfig( state ),
	} ),
	{ initConnection }
)( HappychatConnection );
