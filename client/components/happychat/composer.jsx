/**
 * External dependencies
 */
import React from 'react';
import { connect } from 'react-redux';
import isEmpty from 'lodash/isEmpty';
/**
 * Internal dependencies
 */
import {
	getHappychatMessage,
	getHappychatConnectionStatus
} from 'state/happychat/selectors';
import {
	updateChatMessage,
	sendChatMessage
} from 'state/happychat/actions';
import {
	when,
	forEach,
	compose,
	propEquals,
	call,
	prop
} from './functional';
import scrollbleed from './scrollbleed';
import { translate } from 'i18n-calypso';

// helper function for detecting when a DOM event keycode is pressed
const returnPressed = propEquals( 'which', 13 );
// helper function that calls prevents default on the DOM event
const preventDefault = call( 'preventDefault' );

/*
 * Renders a textarea to be used to comopose a message for the chat.
 */
export const Composer = React.createClass( {
	mixins: [ scrollbleed ],

	render() {
		const { message, onUpdateChatMessage, onSendChatMessage, onFocus } = this.props;
		const sendMessage = when( () => ! isEmpty( message ), () => onSendChatMessage( message ) );
		const onChange = compose( prop( 'target.value' ), onUpdateChatMessage );
		const onKeyDown = when( returnPressed, forEach( preventDefault, sendMessage ) );
		return (
			<div className="happychat__composer"
				onMouseEnter={ this.scrollbleedLock }
				onMouseLeave={ this.scrollbleedUnlock }
				>
				<div className="happychat__message">
					<textarea
						aria-label="Enter your support request"
						ref={ this.setScrollbleedTarget }
						onFocus={ onFocus }
						type="text"
						placeholder={ translate( 'Type a message …' ) }
						onChange={ onChange }
						onKeyDown={ onKeyDown }
						value={ message } />
				</div>
				<button className="happychat__submit"
						onClick={ sendMessage }>
						<svg viewBox="0 0 24 24" width="24" height="24"><path d="M2 21l21-9L2 3v7l15 2-15 2z" /></svg>
				</button>
			</div>
		);
	}
} );

const mapState = ( state ) => ( {
	message: getHappychatMessage( state ),
	connectionStatus: getHappychatConnectionStatus( state )
} );

const mapDispatch = ( dispatch ) => ( {
	onUpdateChatMessage( message ) {
		dispatch( updateChatMessage( message ) );
	},
	onSendChatMessage( message ) {
		dispatch( sendChatMessage( message ) );
	}
} );

export default connect( mapState, mapDispatch )( Composer );
