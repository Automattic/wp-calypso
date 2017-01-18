/**
 * External dependencies
 */
import React from 'react';
import { connect } from 'react-redux';
import classnames from 'classnames';
import GridIcon from 'gridicons';

/**
 * Internal dependencies
 */
import {
	first,
	any,
	when
} from './functional';
import { connectChat } from 'state/happychat/actions';
import {
	getHappychatConnectionStatus
} from 'state/happychat/selectors';
import {
	openChat,
	closeChat,
	minimizeChat,
	minimizedChat
} from 'state/ui/happychat/actions';
import {
	isHappychatMinimizing
} from 'state/ui/happychat/selectors';
import {
	isConnected,
	isConnecting,
	timeline,
	composer
} from './helpers';
import { translate } from 'i18n-calypso';

const isChatOpen = any( isConnected, isConnecting );

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
				<GridIcon icon="chevron-down" />
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
			<GridIcon icon="chevron-down" />
		</div>
	</div>
);

/**
 * Function for rendering correct titlebar based on happychat client state
 */
const title = first(
	when( isConnected, connectedTitle ),
	when( isConnecting, connectingTitle ),
	( { onOpenChat } ) => {
		const onClick = () => onOpenChat();
		return <div onClick={ onClick }>{ translate( 'Support Chat' ) }</div>;
	}
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
			connectionStatus,
			isMinimizing,
			user,
			onCloseChat,
			onOpenChat
		} = this.props;

		return (
			<div className="happychat">
				<div
					className={ classnames( 'happychat__container', {
						'is-open': isChatOpen( { connectionStatus } ),
						'is-minimizing': isMinimizing
					} ) } >
					<div className="happychat__title">
						{ title( {
							connectionStatus,
							isMinimizing,
							user,
							onCloseChat,
							onOpenChat
						} ) }
					</div>
					{ timeline( { connectionStatus, isMinimizing } ) }
					{ composer( { connectionStatus, isMinimizing } ) }
				</div>
			</div>
		);
	}
} );

const mapState = state => {
	return {
		connectionStatus: getHappychatConnectionStatus( state ),
		isMinimizing: isHappychatMinimizing( state )
	};
};

const mapDispatch = ( dispatch ) => {
	return {
		onOpenChat() {
			dispatch( openChat() );
		},
		onCloseChat() {
			dispatch( minimizeChat() );
			setTimeout( function() {
				dispatch( minimizedChat() );
				dispatch( closeChat() );
			}, 500 );
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
