import { useEffect } from 'react';
import { ClosedConversationFooter } from './components/closed-conversation-footer';
import { MessagesContainer } from './components/message/messages-container';
import { OdieSendMessageButton } from './components/send-message-input';
import { useOdieAssistantContext, OdieAssistantProvider } from './context';
import { useCurrentSupportInteraction } from './data/use-current-support-interaction';
import { hasCSATMessage, interactionHasEnded } from './utils';

import './style.scss';

export const OdieAssistant: React.FC = () => {
	const { trackEvent, currentUser, chat } = useOdieAssistantContext();
	const { data: currentSupportInteraction } = useCurrentSupportInteraction();
	const chatHasCSATMessage = hasCSATMessage( chat );
	const showClosedConversationFooter =
		chatHasCSATMessage || interactionHasEnded( currentSupportInteraction );

	useEffect( () => {
		trackEvent( 'chatbox_view' );
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [] );

	return (
		<div className="chatbox">
			<div className="chat-box-message-container" id="odie-messages-container">
				<MessagesContainer currentUser={ currentUser } />
			</div>
			{ showClosedConversationFooter ? <ClosedConversationFooter /> : <OdieSendMessageButton /> }
		</div>
	);
};

export default OdieAssistantProvider;
export { useOdieAssistantContext } from './context';
export type { Conversations, OdieConversation, OdieMessage, SupportInteraction } from './types';
export type { ZendeskConversation, ZendeskMessage } from '@automattic/zendesk-client';
