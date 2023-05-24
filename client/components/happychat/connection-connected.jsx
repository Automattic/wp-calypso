import { connect } from 'react-redux';
import { HappychatConnection } from 'calypso/components/happychat/connection';
import { initConnection } from 'calypso/state/happychat/connection/actions';
import isHappychatConnectionUninitialized from 'calypso/state/happychat/selectors/is-happychat-connection-uninitialized';
import { getHappychatAuth } from 'calypso/state/happychat/utils';

export default connect(
	( state, ownProps ) => ( {
		getAuth: ownProps.getAuth || getHappychatAuth( state ),
		isConnectionUninitialized: isHappychatConnectionUninitialized( state ),
	} ),
	{ initConnection }
)( HappychatConnection );
