/** @format */

/**
 * External dependencies
 */
import classNames from 'classnames';
import React from 'react';
import createReactClass from 'create-react-class';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { isEmpty, throttle } from 'lodash';
import { localize } from 'i18n-calypso';

/**
 * Internal dependencies
 */
import { setCurrentMessage } from 'state/happychat/ui/actions';
import { sendMessage, sendTyping, sendNotTyping } from 'state/happychat/connection/actions';
import getCurrentMessage from 'state/happychat/selectors/get-happychat-current-message';
import { canUserSendMessages } from 'state/happychat/selectors';
import { when, forEach, compose, propEquals, call, prop } from './functional';
import scrollbleed from './scrollbleed';

// helper function for detecting when a DOM event keycode is pressed
const returnPressed = propEquals( 'which', 13 );
// helper function that calls prevents default on the DOM event
const preventDefault = call( 'preventDefault' );

/*
 * Renders a textarea to be used to comopose a message for the chat.
 */
export const Composer = createReactClass( {
	displayName: 'Composer',
	mixins: [ scrollbleed ],

	propTypes: {
		disabled: PropTypes.bool,
		message: PropTypes.string,
		onFocus: PropTypes.func,
		onSendMessage: PropTypes.func,
		onSendTyping: PropTypes.func,
		onSendNotTyping: PropTypes.func,
		translate: PropTypes.func, // localize HOC
	},

	render() {
		const {
			disabled,
			message,
			onFocus,
			onSendMessage,
			onSendNotTyping,
			onSendTyping,
			onSetCurrentMessage,
			translate,
		} = this.props;
		const sendThrottledTyping = throttle(
			msg => {
				onSendTyping( msg );
			},
			1000,
			{ leading: true, trailing: false }
		);
		const sendMsg = when(
			() => ! isEmpty( message ),
			() => {
				onSendMessage( message );
				onSendNotTyping();
			}
		);
		const setMsg = msg => {
			onSetCurrentMessage( msg );
			isEmpty( msg ) ? onSendNotTyping() : sendThrottledTyping( msg );
		};
		const onChange = compose( prop( 'target.value' ), setMsg );
		const onKeyDown = when( returnPressed, forEach( preventDefault, sendMsg ) );
		const composerClasses = classNames( 'happychat__composer', {
			'is-disabled': disabled,
		} );
		return (
			<div
				className={ composerClasses }
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
						disabled={ disabled }
						value={ message }
					/>
				</div>
				<button className="happychat__submit" disabled={ disabled } onClick={ sendMsg }>
					<svg viewBox="0 0 24 24" width="24" height="24">
						<path d="M2 21l21-9L2 3v7l15 2-15 2z" />
					</svg>
				</button>
			</div>
		);
	},
} );

const mapState = state => ( {
	disabled: ! canUserSendMessages( state ),
	message: getCurrentMessage( state ),
} );

const mapDispatch = dispatch => ( {
	onSendTyping( message ) {
		dispatch( sendTyping( message ) );
	},
	onSendNotTyping() {
		dispatch( sendNotTyping() );
	},
	onSendMessage( message ) {
		dispatch( sendMessage( message ) );
	},
	onSetCurrentMessage( message ) {
		dispatch( setCurrentMessage( message ) );
	},
} );

export default connect( mapState, mapDispatch )( localize( Composer ) );
