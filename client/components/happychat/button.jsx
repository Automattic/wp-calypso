import { Button, Gridicon } from '@automattic/components';
import { isMobile } from '@automattic/viewport';
import classnames from 'classnames';
import { localize } from 'i18n-calypso';
import page from 'page';
import PropTypes from 'prop-types';
import { Component } from 'react';
import { connect } from 'react-redux';
import { initConnection } from 'calypso/state/happychat/connection/actions';
import hasActiveHappychatSession from 'calypso/state/happychat/selectors/has-active-happychat-session';
import hasUnreadMessages from 'calypso/state/happychat/selectors/has-unread-messages';
import isHappychatAvailable from 'calypso/state/happychat/selectors/is-happychat-available';
import isHappychatConnectionUninitialized from 'calypso/state/happychat/selectors/is-happychat-connection-uninitialized';
import { openChat } from 'calypso/state/happychat/ui/actions';
import { getHappychatAuth } from 'calypso/state/happychat/utils';
import './button.scss';

const noop = () => {};

export class HappychatButton extends Component {
	static propTypes = {
		allowMobileRedirect: PropTypes.bool,
		borderless: PropTypes.bool,
		primary: PropTypes.bool,
		floating: PropTypes.bool,
		offset: PropTypes.bool,
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
		primary: false,
		floating: false,
		offset: false,
		getAuth: noop,
		initConnection: noop,
		isChatActive: false,
		isChatAvailable: false,
		isConnectionUninitialized: false,
		onClick: noop,
		openChat: noop,
	};

	onClick = ( event ) => {
		if ( this.props.allowMobileRedirect && isMobile() ) {
			// For mobile clients, happychat will always use the
			// page component instead of the sidebar.
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
			floating,
			offset,
			hasUnread,
			isChatAvailable,
			isChatActive,
		} = this.props;
		const showButton = isChatAvailable || isChatActive;
		const classes = classnames( 'happychat__button', className, {
			'is-floating': floating,
			'is-offset': offset,
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
	( state ) => ( {
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
