/**
 * External dependencies
 */
import React, { Component } from 'react';
import { connect } from 'react-redux';
import viewport from 'lib/viewport';
import { findDOMNode } from 'react-dom';
/**
 * Internal dependencies
 */
import { connectChat } from 'state/happychat/actions';
import { getHappychatConnectionStatus } from 'state/happychat/selectors';
import { timeline, composer } from 'components/happychat/helpers';

/**
 * React component for rendering a happychat client as a full page
 */
class HappychatPage extends Component {
	componentDidMount() {
		this.props.openChat();
	}

	onFocus() {
		const composerNode = findDOMNode( this.refs.composer );

		if ( viewport.isMobile() ) {
			/* User tapped textfield on a phone. This shows the keyboard. Unless we scroll to the bottom, the chatbox will be invisible */
			setTimeout( () => composerNode.scrollIntoView(), 500 );	/* Wait for the keyboard to appear */
		}
	}

	render() {
		const { connectionStatus } = this.props;
		return (
			<div className="happychat__page" aria-live="polite" aria-relevant="additions">
				{ timeline( { connectionStatus } ) }
				{ composer( { connectionStatus } ) }
			</div>
		);
	}
}

const mapState = state => ( {
	connectionStatus: getHappychatConnectionStatus( state )
} );

const mapDispatch = dispatch => ( {
	openChat: () => dispatch( connectChat() )
} );

export default connect( mapState, mapDispatch )( HappychatPage );
