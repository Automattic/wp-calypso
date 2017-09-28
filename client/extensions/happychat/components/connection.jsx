/**
 * External dependencies
 */
import { Component } from 'react';
import { connect } from 'react-redux';

/**
 * Internal dependencies
 */
import config from 'config';
import { connectChat } from 'extensions/happychat/state/actions';
import { isHappychatConnectionUninitialized } from 'extensions/happychat/state/selectors';

class HappychatConnection extends Component {
	componentDidMount() {
		if ( config.isEnabled( 'happychat' ) && this.props.isUninitialized ) {
			this.props.connectChat();
		}
	}

	render() {
		return null;
	}
}

export default connect(
	state => ( {
		isUninitialized: isHappychatConnectionUninitialized( state )
	} ),
	{ connectChat }
)( HappychatConnection );
