/** @format */

/**
 * External dependencies
 */
import { connect } from 'react-redux';

/**
 * Internal dependencies
 */
import config from 'config';
import { getHappychatAuth } from 'client/state/happychat/utils';
import isHappychatConnectionUninitialized from 'client/state/happychat/selectors/is-happychat-connection-uninitialized';
import { initConnection } from 'client/state/happychat/connection/actions';
import { HappychatConnection } from 'client/components/happychat/connection';

export default connect(
	state => ( {
		getAuth: getHappychatAuth( state ),
		isConnectionUninitialized: isHappychatConnectionUninitialized( state ),
		isHappychatEnabled: config.isEnabled( 'happychat' ),
	} ),
	{ initConnection }
)( HappychatConnection );
