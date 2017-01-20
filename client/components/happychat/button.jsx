/**
 * External dependencies
 */
import React, { Component } from 'react';
import page from 'page';
import { connect } from 'react-redux';
import { localize } from 'i18n-calypso';
import Gridicon from 'gridicons';

/**
 * Internal dependencies
 */
import viewport from 'lib/viewport';
import { openChat } from 'state/ui/happychat/actions';
import Button from 'components/button';

class HappychatButton extends Component {
	onOpenChat = () => {
		const { onOpenChat } = this.props;
		if ( viewport.isMobile() ) {
			// For mobile clients, happychat will always use the page compoent instead of the sidebar
			page( '/me/chat' );
		} else {
			onOpenChat();
		}
	}

	render() {
		const { translate } = this.props;
		return (
			<Button
				className="sidebar__footer-chat"
				borderless
				onClick={ this.onOpenChat }
				title={ translate( 'Support Chat' ) }>
				<Gridicon icon="chat" />
			</Button>
		);
	}
}

export default connect( null, { onOpenChat: openChat } )( localize( HappychatButton ) );
