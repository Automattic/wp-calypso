import { Spinner } from '@automattic/components';
import { forwardRef } from 'react';
import { useOdieAssistantContext } from '../../context';
import ChatMessage from '.';
import type { CurrentUser, Message } from '../../types/';

interface ChatMessagesProps {
	chat: {
		messages: Message[];
		loading?: boolean;
	};
	currentUser: CurrentUser;
}

export const MessagesContainer = forwardRef< HTMLDivElement, ChatMessagesProps >(
	( { currentUser }, ref ) => {
		const { chat } = useOdieAssistantContext();

		let lastUserMessageIndex = -1;
		let lastFeedbackMessageIndex = -1;
		let lastErrorMessageIndex = -1;

		chat.messages.forEach( ( message, index ) => {
			if ( message.role === 'user' ) {
				lastUserMessageIndex = index;
			}
			if ( message.type === 'dislike-feedback' ) {
				lastFeedbackMessageIndex = index;
			}
			if ( message.type === 'error' ) {
				lastErrorMessageIndex = index;
			}
		} );

		const lastMessageIndex = chat.messages.length - 1;

		if ( chat.loading ) {
			return (
				<div className="odie-loading-container" ref={ lastMessageWapuuRef }>
					<Spinner />
				</div>
			);
		}

		if ( chat.messages.length === 0 ) {
			return (
				<>
					<div ref={ ref } className="odie-referenced-message"></div>;
					<div className="odie-last-message" ref={ lastMessageWapuuRef }></div>
				</>
			);
		}

		return (
			<div className="chatbox-messages" ref={ ref }>
				{ chat.messages.map( ( message, index ) => (
					<ChatMessage
						message={ message }
						key={ index }
						currentUser={ currentUser }
						isLastUserMessage={ lastUserMessageIndex === index }
						isLastFeedbackMessage={ lastFeedbackMessageIndex === index }
						isLastErrorMessage={ lastErrorMessageIndex === index }
						isLastMessage={ lastMessageIndex === index }
					/>
				) ) }
			</div>
		);
	}
);
