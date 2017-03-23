/**
 * External dependencies
 */
import React, { Component } from 'react';
import { connect } from 'react-redux';
import { get } from 'lodash';

/**
 * Internal dependencies
 */
import { localize } from 'i18n-calypso';
import {
    HAPPYCHAT_CHAT_STATUS_ASSIGNING,
    HAPPYCHAT_CHAT_STATUS_PENDING,
    HAPPYCHAT_CHAT_STATUS_MISSED,
    HAPPYCHAT_CHAT_STATUS_ABANDONED,
    getHappychatStatus,
    getHappychatConnectionStatus,
} from 'state/happychat/selectors';

/*
 * Renders any notices about the chat session to the user
 */
class Notices extends Component {
    statusNotice() {
        const { isConnected, chatStatus, translate } = this.props;

        if (!isConnected) {
            return translate(
                "We're having trouble connecting to chat. Please check your internet connection and refresh the page."
            );
        }

        const noticeText = {
            [HAPPYCHAT_CHAT_STATUS_ABANDONED]: translate(
                "We're having some connection trouble on our end, please bear with us."
            ),
            [HAPPYCHAT_CHAT_STATUS_ASSIGNING]: translate(
                'Connecting you with a Happiness Engineer…'
            ),
            [HAPPYCHAT_CHAT_STATUS_PENDING]: translate(
                "Sorry, we couldn't connect you with a Happiness Engineer. Please check back later."
            ),
            [HAPPYCHAT_CHAT_STATUS_MISSED]: translate(
                'Sorry, we missed you! All our Happiness Engineers are currently busy. Please check back later.'
            ),
        };

        return get(noticeText, chatStatus, null);
    }

    render() {
        const noticeText = this.statusNotice();

        if (noticeText == null) {
            return null;
        }

        return (
            <div className="happychat__notice">
                {noticeText}
            </div>
        );
    }
}

const mapState = state => ({
    isConnected: getHappychatConnectionStatus(state) === 'connected',
    chatStatus: getHappychatStatus(state),
});

export default localize(connect(mapState)(Notices));
