/**
 * External dependencies
 */
import { connect } from 'react-redux';

/**
 * Internal dependencies
 */
import config from 'config';
import { getHappychatAuth } from 'state/happychat/utils';
import isHappychatConnectionUninitialized from 'state/happychat/selectors/is-happychat-connection-uninitialized';
import { initConnection } from 'state/happychat/connection/actions';
import { HappychatConnection } from 'components/happychat/connection';

export default connect(
	( state ) => ( {
		getAuth: getHappychatAuth( state ),
		isConnectionUninitialized: isHappychatConnectionUninitialized( state ),
		isHappychatEnabled: config.isEnabled( 'happychat' ),
	} ),
	{ initConnection }
)( HappychatConnection );
