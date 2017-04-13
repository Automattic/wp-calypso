/**
 * External dependencies
 */
import React, { Component, PropTypes } from 'react';
import page from 'page';
import { identity, noop } from 'lodash';
import { connect } from 'react-redux';
import { localize } from 'i18n-calypso';
import Gridicon from 'gridicons';
import classnames from 'classnames';

/**
 * Internal dependencies
 */
import viewport from 'lib/viewport';
import {
	hasUnreadMessages,
	isHappychatAvailable,
	isHappychatChatActive,
} from 'state/happychat/selectors';
import { connectChat } from 'state/happychat/actions';
import { openChat } from 'state/ui/happychat/actions';
import Button from 'components/button';

class HappychatButton extends Component {
	static propTypes = {
		allowMobileRedirect: PropTypes.bool,
		borderless: PropTypes.bool,
		connectChat: PropTypes.func,
		isChatActive: PropTypes.bool,
		isChatAvailable: PropTypes.bool,
		onClick: PropTypes.func,
		openChat: PropTypes.func,
		translate: PropTypes.func,
	};

	static defaultProps = {
		allowMobileRedirect: false,
		borderless: true,
		connectChat: noop,
		isChatActive: false,
		isChatAvailable: false,
		onClick: noop,
		openChat: noop,
		translate: identity,
	};

	onClick = ( event ) => {
		if ( this.props.allowMobileRedirect && viewport.isMobile() ) {
			// For mobile clients, happychat will always use the
			// page componet instead of the sidebar
			page( '/me/chat' );
		} else {
			this.props.openChat();
		}

		this.props.onClick( event );
	}

	componentDidMount() {
		this.props.connectChat();
	}

	render() {
		const { translate, children, className, borderless, hasUnread, isChatAvailable, isChatActive } = this.props;
		const showButton = isChatAvailable || isChatActive;
		const classes = classnames( 'happychat__button', className, {
			'has-unread': hasUnread
		} );

		if ( ! showButton ) {
			return null;
		}

		return (
			<Button
				className={ classes }
				borderless={ borderless }
				onClick={ this.onClick }
				title={ translate( 'Support Chat' ) }>
				{ children || <Gridicon icon="chat" /> }
			</Button>
		);
	}
}

export default connect(
	state => ( {
		hasUnread: hasUnreadMessages( state ),
		isChatAvailable: isHappychatAvailable( state ),
		isChatActive: isHappychatChatActive( state ),
	} ),
	{
		openChat,
		connectChat,
	}
)( localize( HappychatButton ) );
