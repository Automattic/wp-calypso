import moment from 'moment';
import { forwardRef } from 'react';
import { useOdieAssistantContext } from '../../context';
import ChatMessageV2 from './index-v2';
import ChatMessage from '.';
import type { CurrentUser } from '../../types/';

interface ChatMessagesProps {
	currentUser: CurrentUser;
}

export const MessagesContainer = forwardRef< HTMLDivElement, ChatMessagesProps >(
	( { currentUser }, ref ) => {
		const { chat } = useOdieAssistantContext();

		//TODO: Fix the date
		const chatCreationDate = moment( chat?.created_at ).format( 'MMM DD, YYYY' );

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

		return (
			<div className="chatbox-messages" ref={ ref }>
				{ chat?.created_at && (
					<div className="chatbox-messages-creation-date">{ chatCreationDate }</div>
				) }
				{ chat.messages.map( ( message, index ) => (
					<ChatMessageV2
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
