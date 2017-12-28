/** @format */

/**
 * External dependencies
 */

import PropTypes from 'prop-types';
import React, { Component } from 'react';
import page from 'page';
import { identity, noop } from 'lodash';
import { connect } from 'react-redux';
import { localize } from 'i18n-calypso';
import Gridicon from 'gridicons';
import classnames from 'classnames';

/**
 * Internal dependencies
 */
import viewport from 'client/lib/viewport';
import { getHappychatAuth } from 'client/state/happychat/utils';
import hasUnreadMessages from 'client/state/happychat/selectors/has-unread-messages';
import hasActiveHappychatSession from 'client/state/happychat/selectors/has-active-happychat-session';
import isHappychatAvailable from 'client/state/happychat/selectors/is-happychat-available';
import isHappychatConnectionUninitialized from 'client/state/happychat/selectors/is-happychat-connection-uninitialized';
import { initConnection } from 'client/state/happychat/connection/actions';
import { openChat } from 'client/state/happychat/ui/actions';
import Button from 'client/components/button';

export class HappychatButton extends Component {
	static propTypes = {
		allowMobileRedirect: PropTypes.bool,
		borderless: PropTypes.bool,
		getAuth: PropTypes.func,
		initConnection: PropTypes.func,
		isChatActive: PropTypes.bool,
		isChatAvailable: PropTypes.bool,
		isConnectionUninitialized: PropTypes.bool,
		onClick: PropTypes.func,
		openChat: PropTypes.func,
		translate: PropTypes.func,
	};

	static defaultProps = {
		allowMobileRedirect: false,
		borderless: true,
		getAuth: noop,
		initConnection: noop,
		isChatActive: false,
		isChatAvailable: false,
		isConnectionUninitialized: false,
		onClick: noop,
		openChat: noop,
		translate: identity,
	};

	onClick = event => {
		if ( this.props.allowMobileRedirect && viewport.isMobile() ) {
			// For mobile clients, happychat will always use the
			// page componet instead of the sidebar
			page( '/me/chat' );
		} else {
			this.props.openChat();
		}

		this.props.onClick( event );
	};

	componentDidMount() {
		if ( this.props.isConnectionUninitialized ) {
			this.props.initConnection( this.props.getAuth() );
		}
	}

	render() {
		const {
			translate,
			children,
			className,
			primary,
			borderless,
			hasUnread,
			isChatAvailable,
			isChatActive,
		} = this.props;
		const showButton = isChatAvailable || isChatActive;
		const classes = classnames( 'happychat__button', className, {
			'has-unread': hasUnread,
		} );

		if ( ! showButton ) {
			return null;
		}

		return (
			<Button
				className={ classes }
				primary={ primary }
				borderless={ borderless }
				onClick={ this.onClick }
				title={ translate( 'Support Chat' ) }
			>
				{ children || <Gridicon icon="chat" /> }
			</Button>
		);
	}
}

export default connect(
	state => ( {
		hasUnread: hasUnreadMessages( state ),
		getAuth: getHappychatAuth( state ),
		isChatAvailable: isHappychatAvailable( state ),
		isChatActive: hasActiveHappychatSession( state ),
		isConnectionUninitialized: isHappychatConnectionUninitialized( state ),
	} ),
	{
		openChat,
		initConnection,
	}
)( localize( HappychatButton ) );
