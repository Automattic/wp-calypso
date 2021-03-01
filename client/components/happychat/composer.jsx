/**
 * External dependencies
 */
import classNames from 'classnames';
import React from 'react';
import createReactClass from 'create-react-class';
import PropTypes from 'prop-types';
import { get, isEmpty, throttle } from 'lodash';

/**
 * Internal dependencies
 */
import FormTextarea from 'calypso/components/forms/form-textarea';
import scrollbleed from './scrollbleed';
import { Button } from '@automattic/components';

/**
 * Style dependencies
 */
import './composer.scss';

const sendThrottledTyping = throttle(
	( onSendTyping, msg ) => {
		onSendTyping( msg );
	},
	1000,
	{ leading: true, trailing: false }
);

/*
 * Renders a textarea to be used to comopose a message for the chat.
 */
// eslint-disable-next-line react/prefer-es6-class
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
		onSetCurrentMessage: PropTypes.func,
		translate: PropTypes.func, // localize HOC
	},

	onChange( event ) {
		const { onSendTyping, onSendNotTyping, onSetCurrentMessage } = this.props;

		const msg = get( event, 'target.value' );
		onSetCurrentMessage( msg );
		isEmpty( msg ) ? onSendNotTyping() : sendThrottledTyping( onSendTyping, msg );
	},

	onKeyDown( event ) {
		const RETURN_KEYCODE = 13;
		if ( get( event, 'which' ) === RETURN_KEYCODE ) {
			event.preventDefault();
			this.sendMessage();
		}
	},

	sendMessage() {
		const { message, onSendMessage, onSendNotTyping } = this.props;
		if ( ! isEmpty( message ) ) {
			onSendMessage( message );
			onSendNotTyping();
		}
	},

	render() {
		const { disabled, message, onFocus, translate } = this.props;
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
					<FormTextarea
						aria-label="Enter your support request"
						forwardedRef={ this.setScrollbleedTarget }
						onFocus={ onFocus }
						placeholder={ translate( 'Type a message…' ) }
						onChange={ this.onChange }
						onKeyDown={ this.onKeyDown }
						disabled={ disabled }
						value={ message }
					/>
				</div>
				<Button
					primary
					className="happychat__submit"
					disabled={ disabled }
					onClick={ this.sendMessage }
				>
					<svg viewBox="0 0 24 24" width="24" height="24">
						<path d="M2 21l21-9L2 3v7l15 2-15 2z" />
					</svg>
				</Button>
			</div>
		);
	},
} );
