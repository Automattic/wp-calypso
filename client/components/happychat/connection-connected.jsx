/** @format */

/**
 * External dependencies
 */
import { connect } from 'react-redux';

/**
 * Internal dependencies
 */
import config from 'config';
// actions
import { initConnection } from 'state/happychat/connection/actions';
//selectors
import { getHappychatAuth } from 'state/happychat/utils';
import isHappychatConnectionUninitialized from 'state/happychat/selectors/is-happychat-connection-uninitialized';

import { HappychatConnection } from './connection';

export default connect(
	state => ( {
		getAuth: getHappychatAuth( state ),
		isHappychatEnabled: config.isEnabled( 'happychat' ),
		isConnectionUninitialized: isHappychatConnectionUninitialized( state ),
	} ),
	{
		onInitConnection: initConnection,
	}
)( HappychatConnection );
