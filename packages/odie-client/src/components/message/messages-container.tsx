import { useRef } from 'react';
import { useOdieAssistantContext } from '../../context';
import useAutoScroll from '../../useAutoScroll';
import { useZendeskMessageListener } from '../../utils';
import { DislikeFeedbackMessage } from './dislike-feedback-message';
import { JumpToRecent } from './jump-to-recent';
import { ThinkingPlaceholder } from './thinking-placeholder';
import ChatMessage from '.';
import type { CurrentUser } from '../../types/';

interface ChatMessagesProps {
	currentUser: CurrentUser;
}

export const MessagesContainer = ( { currentUser }: ChatMessagesProps ) => {
	const { chat, chatStatus } = useOdieAssistantContext();
	const messagesContainerRef = useRef< HTMLDivElement >( null );
	useZendeskMessageListener();
	useAutoScroll( messagesContainerRef );

	return (
		<>
			<div className="chatbox-messages" ref={ messagesContainerRef }>
				{ chat.messages.map( ( message, index ) => (
					<ChatMessage message={ message } key={ index } currentUser={ currentUser } />
				) ) }
				<JumpToRecent containerReference={ messagesContainerRef } />

				<div className="odie-chatbox__action-message">
					{ chatStatus === 'sending' && <ThinkingPlaceholder /> }
					{ chatStatus === 'dislike' && <DislikeFeedbackMessage /> }
				</div>
			</div>
		</>
	);
};
