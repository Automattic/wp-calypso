/** @format */

/**
 * External dependencies
 */
import React, { Component } from 'react';
/**
 * Internal dependencies
 */
import HappychatClient from 'blocks/happychat/chat-client';
import { LAYOUT_FULLSCREEN } from 'blocks/happychat/chat-client/constants';

/**
 * React component for rendering a happychat client as a full page
 */
export class HappychatPage extends Component {
	render() {
		return (
			<div className="chat-page" aria-live="polite" aria-relevant="additions">
				<HappychatClient layout={ LAYOUT_FULLSCREEN } />
			</div>
		);
	}
}

export default HappychatPage;
