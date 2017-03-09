/**
 * External dependencies
 */
import React, { Component } from 'react';
import page from 'page';
import { connect } from 'react-redux';
import { localize } from 'i18n-calypso';
import Gridicon from 'gridicons';
import classnames from 'classnames';

/**
 * Internal dependencies
 */
import viewport from 'lib/viewport';
import { openChat } from 'state/ui/happychat/actions';
import { isHappychatBadgeVisible } from 'state/ui/happychat/selectors';
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
		const { translate, isBadged } = this.props;
		return (
			<Button
				className={ classnames(
						'happychat__sidebar-footer-button',
						'sidebar__footer-chat',
						{ 'has-unread': isBadged }
					) }
				borderless
				onClick={ this.onOpenChat }
				title={ translate( 'Support Chat' ) }>
				<Gridicon icon="chat" />
			</Button>
		);
	}
}

const mapState = state => ( { isBadged: isHappychatBadgeVisible( state ) } );
const mapDispatch = { onOpenChat: openChat };

export default connect( mapState, mapDispatch )( localize( HappychatButton ) );
