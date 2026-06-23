import { useEffect } from 'react';
import { ClosedConversationFooter } from './components/closed-conversation-footer';
import { MessagesContainer } from './components/message/messages-container';
import { OdieSendMessageButton } from './components/send-message-input';
import { useOdieAssistantContext, OdieAssistantProvider } from './context';
import { useCurrentSupportInteraction } from './data/use-current-support-interaction';
import { useOpenLiveInteractions } from './hooks/use-open-interaction-status-map';
import { hasCSATMessage, interactionHasEnded } from './utils';

import './style.scss';

export const OdieAssistant: React.FC = () => {
	const { trackEvent, currentUser, chat } = useOdieAssistantContext();
	const { data: currentSupportInteraction } = useCurrentSupportInteraction();
	const chatHasCSATMessage = hasCSATMessage( chat );
	const showClosedConversationFooter =
		chatHasCSATMessage || interactionHasEnded( currentSupportInteraction );

	const { mostRecentSupportInteractionId, openCount } = useOpenLiveInteractions();

	// When the current chat is closed and at least one other live chat is open, link
	// the user to the most recent open chat. Require both UUIDs to be present so the
	// self-link guard is reliable even before currentSupportInteraction has loaded.
	const currentUuid = currentSupportInteraction?.uuid;
	const openChatTarget =
		showClosedConversationFooter &&
		openCount >= 1 &&
		mostRecentSupportInteractionId != null &&
		currentUuid != null &&
		mostRecentSupportInteractionId !== currentUuid
			? mostRecentSupportInteractionId
			: null;

	useEffect( () => {
		trackEvent( 'chatbox_view' );
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [] );

	return (
		<div className="chatbox">
			<div className="chat-box-message-container" id="odie-messages-container">
				<MessagesContainer currentUser={ currentUser } />
			</div>
			{ showClosedConversationFooter ? (
				<ClosedConversationFooter targetInteractionId={ openChatTarget } />
			) : (
				<OdieSendMessageButton />
			) }
		</div>
	);
};
export { GetSupport } from './components/message/get-support';

export default OdieAssistantProvider;
export { useOdieAssistantContext } from './context';
export type { Conversations, OdieConversation, OdieMessage, SupportInteraction } from './types';
export type { ZendeskConversation, ZendeskMessage } from '@automattic/zendesk-client';
export { convertOdieChatToOdieConversation } from './utils/chat-utils';
export * from './types';
