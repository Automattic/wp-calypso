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
	const { data: currentSupportInteraction, isLoading: isLoadingInteraction } =
		useCurrentSupportInteraction();
	const chatHasCSATMessage = hasCSATMessage( chat );
	const showClosedConversationFooter =
		isLoadingInteraction || chatHasCSATMessage || interactionHasEnded( currentSupportInteraction );

	const currentUuid = currentSupportInteraction?.uuid;
	const { mostRecentSupportInteractionId, openCount } = useOpenLiveInteractions( currentUuid );

	// Show the link only when at least one other live chat exists and the target is
	// known. Require currentUuid to be loaded so we know the exclusion was applied.
	// Use truthy checks: an empty string is not a valid target.
	// Also guard defensively that the resolved target isn't the current interaction.
	const openChatTarget =
		showClosedConversationFooter &&
		openCount >= 1 &&
		!! mostRecentSupportInteractionId &&
		!! currentUuid &&
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
				<ClosedConversationFooter
					currentInteractionId={ currentUuid }
					targetInteractionId={ openChatTarget }
				/>
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
