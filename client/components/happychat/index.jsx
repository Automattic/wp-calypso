import React from 'react';
import { connect } from 'react-redux';
import classnames from 'classnames';

import GridIcon from 'components/gridicon';
import {
	first,
	any,
	all,
	when
} from './functional';
import { connectChat } from 'state/happychat/actions';
import {
	openChat,
	closeChat,
} from 'state/ui/happychat/actions';
import {
	isConnected,
	isConnecting,
	isAvailable,
	timeline,
	composer
} from './helpers';

const isChatOpen = all(
	isAvailable,
	any( isConnected, isConnecting )
);

/*
 * Renders chat title message to display when chat is not active.
 * Allows for different messages depending on whether live chats are available.
 */
const availabilityTitle = when(
	isAvailable,
	( { onOpenChat } ) => {
		const onClick = () => onOpenChat();
		return <div onClick={ onClick }>Support Chat</div>;
	},
	() => <div>Live Support Unavailable</div>
);

const connectingTitle = ( { onCloseChat } ) => {
	return (
		<div className="happychat__active-toolbar">
			<span>Starting chat</span>
			<div onClick={ onCloseChat }>
				<GridIcon icon="cross" />
			</div>
		</div>
	);
};

const connectedTitle = ( { onCloseChat } ) => (
	<div className="happychat__active-toolbar">
		<h4>Support Chat</h4>
		<div onClick={ onCloseChat }>
			<GridIcon icon="cross" />
		</div>
	</div>
);

const title = first(
	when( isConnected, connectedTitle ),
	when( isConnecting, connectingTitle ),
	availabilityTitle
);

/*
 * Main chat UI component
 */
const Happychat = React.createClass( {

	componentDidMount() {
		this.props.connectChat();
	},

	render() {
		const {
			available,
			connectionStatus,
			user,
			onCloseChat,
			onOpenChat
		} = this.props;

		return (
			<div className="happychat__container">
				<div
					className={ classnames( 'happychat', { open: isChatOpen( { connectionStatus, available } ) } ) }>
					<div className="happychat__title">
						{ title( {
							available,
							connectionStatus,
							user,
							onCloseChat,
							onOpenChat
						} ) }
					</div>
					{ timeline( { connectionStatus } ) }
					{ composer( { connectionStatus } ) }
				</div>
			</div>
		);
	}
} );

const mapState = ( { happychat: { available, status: connectionStatus } } ) => {
	return {
		available,
		connectionStatus
	};
};

const mapDispatch = ( dispatch ) => {
	return {
		onOpenChat() {
			dispatch( openChat() );
		},
		onCloseChat() {
			dispatch( closeChat() );
		},
		connectChat() {
			dispatch( connectChat() );
		}
	};
};

/*
 * Export redux connected component
 */
export default connect( mapState, mapDispatch )( Happychat );
