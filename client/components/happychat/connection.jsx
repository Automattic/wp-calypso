/**
 * External dependencies
 */
import { Component } from 'react';
import { connect } from 'react-redux';

/**
 * Internal dependencies
 */
import config from 'config';
import { connectChat } from 'state/happychat/actions';
import { isHappychatUninitialized } from 'state/happychat/selectors';

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
		isUninitialized: isHappychatUninitialized( state )
	} ),
	{ connectChat }
)( HappychatConnection );
