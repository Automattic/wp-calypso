/**
 * External dependencies
 */
import React from 'react';
import { connect } from 'react-redux';
import classnames from 'classnames';
/**
 * Internal dependencies
 */
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
import { translate } from 'i18n-calypso';

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

/**
 * Renders the title text of the chat sidebar when happychat is connecting.
 * @param {Object} params - parameters for the component
 * @param {function} params.onCloseChat - function called when close button is pressed
 * @returns {Object} react component for title bar
 */
const connectingTitle = ( { onCloseChat } ) => {
	return (
		<div className="happychat__active-toolbar">
		<span>{ translate( 'Starting chat' ) }</span>
			<div onClick={ onCloseChat }>
				<GridIcon icon="cross" />
			</div>
		</div>
	);
};

/**
 * Returns the title bar for Happychat when it is connected
 * @private
 * @param {Object} params - parameters for the component
 * @param {function} params.onCloseChat - function called when close button is pressed
 * @returns {Object} react component for title bar
 */
const connectedTitle = ( { onCloseChat } ) => (
	<div className="happychat__active-toolbar">
	<h4>{ translate( 'Support Chat' ) }</h4>
		<div onClick={ onCloseChat }>
			<GridIcon icon="cross" />
		</div>
	</div>
);

/**
 * Funciton for rendering correct titlebar based on happychat client state
 */
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
			<div className="happychat">
				<div
					className={ classnames( 'happychat__container', { open: isChatOpen( { connectionStatus, available } ) } ) }>
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
