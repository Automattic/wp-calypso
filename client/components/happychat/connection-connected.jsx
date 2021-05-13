/**
 * External dependencies
 */
import { connect } from 'react-redux';

/**
 * Internal dependencies
 */
import config from '@automattic/calypso-config';
import { getHappychatAuth } from 'calypso/state/happychat/utils';
import isHappychatConnectionUninitialized from 'calypso/state/happychat/selectors/is-happychat-connection-uninitialized';
import { initConnection } from 'calypso/state/happychat/connection/actions';
import { HappychatConnection } from 'calypso/components/happychat/connection';

export default connect(
	( state ) => ( {
		getAuth: getHappychatAuth( state ),
		isConnectionUninitialized: isHappychatConnectionUninitialized( state ),
		isHappychatEnabled: config.isEnabled( 'happychat' ),
	} ),
	{ initConnection }
)( HappychatConnection );
