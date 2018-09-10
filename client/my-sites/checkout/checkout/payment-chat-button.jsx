/** @format */

/**
 * External dependencies
 */

import React, { Component } from 'react';
import { connect } from 'react-redux';
import { localize } from 'i18n-calypso';
import GridiconChat from 'gridicons/dist/chat';

/**
 * Internal dependencies
 */
import HappychatButton from 'components/happychat/button';
import { recordTracksEvent } from 'state/analytics/actions';

export class PaymentChatButton extends Component {
	chatButtonClicked = () => {
		this.props.recordTracksEvent( 'calypso_presales_chat_click' );
	};

	render() {
		const { translate } = this.props;

		return (
			<HappychatButton className="checkout__payment-chat-button" onClick={ this.chatButtonClicked }>
				<GridiconChat className="checkout__payment-chat-button-icon" />
				{ translate( 'Need help? Chat with us' ) }
			</HappychatButton>
		);
	}
}

export default connect(
	null,
	{ recordTracksEvent }
)( localize( PaymentChatButton ) );
