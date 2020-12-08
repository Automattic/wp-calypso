/**
 * External dependencies
 */
import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { get } from 'lodash';

/**
 * Internal dependencies
 */
import {
	HAPPYCHAT_CHAT_STATUS_ABANDONED,
	HAPPYCHAT_CHAT_STATUS_ASSIGNING,
	HAPPYCHAT_CHAT_STATUS_MISSED,
	HAPPYCHAT_CHAT_STATUS_PENDING,
	HAPPYCHAT_CONNECTION_STATUS_CONNECTING,
	HAPPYCHAT_CONNECTION_STATUS_DISCONNECTED,
	HAPPYCHAT_CONNECTION_STATUS_RECONNECTING,
	HAPPYCHAT_CONNECTION_STATUS_UNAUTHORIZED,
	HAPPYCHAT_CONNECTION_STATUS_UNINITIALIZED,
} from 'calypso/state/happychat/constants';

/**
 * Style dependencies
 */
import './notices.scss';

/*
 * Renders any notices about the chat session to the user
 */
export class Notices extends Component {
	statusNotice() {
		const { isServerReachable, connectionStatus, chatStatus, translate } = this.props;

		if ( ! isServerReachable ) {
			return translate(
				"We're having trouble connecting to chat. Please check your internet connection while we try to reconnect…"
			);
		}

		switch ( connectionStatus ) {
			case HAPPYCHAT_CONNECTION_STATUS_UNINITIALIZED:
				return translate( 'Waiting to connect you with a Happiness Engineer…' );
			case HAPPYCHAT_CONNECTION_STATUS_CONNECTING:
				return translate( 'Connecting you with a Happiness Engineer…' );
			case HAPPYCHAT_CONNECTION_STATUS_RECONNECTING:
			case HAPPYCHAT_CONNECTION_STATUS_DISCONNECTED:
				return translate(
					"We're having trouble connecting to chat. Please bear with us while we try to reconnect…"
				);
			case HAPPYCHAT_CONNECTION_STATUS_UNAUTHORIZED:
				return translate(
					'Chat is not available at the moment. For help, please contact us in {{link}}Support{{/link}}',
					{
						components: {
							link: <a href="https://wordpress.com/help/contact" />,
						},
					}
				);
		}

		const noticeText = {
			[ HAPPYCHAT_CHAT_STATUS_ABANDONED ]: translate(
				"We're having some connection trouble on our end, please bear with us."
			),
			[ HAPPYCHAT_CHAT_STATUS_ASSIGNING ]: translate( 'Connecting you with a Happiness Engineer…' ),
			[ HAPPYCHAT_CHAT_STATUS_PENDING ]: translate(
				"Sorry, we couldn't connect you with a Happiness Engineer. Please check back later."
			),
			[ HAPPYCHAT_CHAT_STATUS_MISSED ]: translate(
				'Sorry, we missed you! All our Happiness Engineers are currently busy. Please check back later.'
			),
		};

		return get( noticeText, chatStatus, null );
	}

	render() {
		const noticeText = this.statusNotice();

		if ( noticeText == null ) {
			return null;
		}

		return <div className="happychat__notice">{ noticeText }</div>;
	}
}

Notices.propTypes = {
	chatStatus: PropTypes.string,
	connectionStatus: PropTypes.string,
	isServerReachable: PropTypes.bool,
	translate: PropTypes.func,
};
