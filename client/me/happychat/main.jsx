/**
 * External dependencies
 *
 * @format
 */

import React, { Component } from 'react';
import { connect } from 'react-redux';
import { findDOMNode } from 'react-dom';
/**
 * Internal dependencies
 */
import { blur, focus } from 'state/happychat/ui/actions';
import viewport from 'lib/viewport';
import { connectChat } from 'state/happychat/connection/actions';
import isHappychatConnectionUninitialized from 'state/happychat/selectors/is-happychat-connection-uninitialized';
import Composer from 'components/happychat/composer';
import Notices from 'components/happychat/notices';
import Timeline from 'components/happychat/timeline';
import config from 'config';

/**
 * React component for rendering a happychat client as a full page
 */
class HappychatPage extends Component {
	componentDidMount() {
		if ( this.props.isEnabled && this.props.isUninitialized ) {
			this.props.connectChat();
		}
		this.props.setFocused();
	}

	componentWillUnmount() {
		this.props.setBlurred();
	}

	onFocus() {
		// TODO: Is this function ever called? I can't seem to get it to trigger --mattwondra
		const composerNode = findDOMNode( this.refs.composer );

		if ( viewport.isMobile() ) {
			/* User tapped textfield on a phone. This shows the keyboard. Unless we scroll to the bottom, the chatbox will be invisible */
			setTimeout( () => composerNode.scrollIntoView(), 500 ); /* Wait for the keyboard to appear */
		}
	}

	render() {
		return (
			<div className="happychat__page" aria-live="polite" aria-relevant="additions">
				<Timeline />
				<Notices />
				<Composer />
			</div>
		);
	}
}

const mapDispatch = {
	connectChat: connectChat,
	setBlurred: blur,
	setFocused: focus,
};

export default connect(
	state => ( {
		isEnabled: config.isEnabled( 'happychat' ),
		isUninitialized: isHappychatConnectionUninitialized( state ),
	} ),
	mapDispatch
)( HappychatPage );
