/**
 * External dependencies
 */
import React from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useTranslate } from 'i18n-calypso';
import Gridicon from 'calypso/components/gridicon';
import styled from '@emotion/styled';

/**
 * Internal dependencies
 */
import HappychatButton from 'calypso/components/happychat/button';
import { recordTracksEvent } from 'calypso/state/analytics/actions';
import getSupportLevel from 'calypso/state/selectors/get-support-level';

const PaymentChatButtonText = styled.span`
	padding-left: 4px;
`;

export default function PaymentChatButton( { plan }: { plan: string | undefined } ): JSX.Element {
	const reduxDispatch = useDispatch();
	const translate = useTranslate();
	const supportLevel = useSelector( getSupportLevel );

	const chatButtonClicked = () => {
		reduxDispatch(
			recordTracksEvent( 'calypso_presales_chat_click', {
				plan,
				support_level: supportLevel,
			} )
		);
	};

	return (
		<HappychatButton className="payment-chat-button" onClick={ chatButtonClicked }>
			<Gridicon icon="chat" className="payment-chat-button__icon" />
			<PaymentChatButtonText>{ translate( 'Need help? Chat with us' ) }</PaymentChatButtonText>
		</HappychatButton>
	);
}
