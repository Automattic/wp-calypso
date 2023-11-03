import { useRef } from 'react';
import TrackComponentView from 'calypso/lib/analytics/track-component-view';
import { useOdieAssistantContext } from './context';
import ChatMessage from './message';
import { OdieSendMessageButton } from './send-message-input';

import './style.scss';

export const WAPUU_ERROR_MESSAGE =
	"Wapuu oopsie! 😺 My bad, but even cool pets goof. Let's laugh it off! 🎉, ask me again as I forgot what you said!";

const OdieAssistant = () => {
	const { chat, botNameSlug } = useOdieAssistantContext();
	const messagesEndRef = useRef< HTMLDivElement | null >( null );
	const messagesContainer = useRef< HTMLDivElement | null >( null );
	const bottomRef = useRef< HTMLDivElement | null >( null );

	return (
		<div className="chatbox">
			<TrackComponentView
				eventName="calypso_odie_chatbox_view"
				eventProperties={ { bot_name_slug: botNameSlug } }
			/>
			<div className="chat-box-message-container" ref={ messagesContainer }>
				<div className="chatbox-messages">
					{ chat.messages.map( ( message, index ) => (
						<ChatMessage
							message={ message }
							isLast={ index === chat.messages.length - 1 }
							messageEndRef={ messagesEndRef }
							key={ index }
						/>
					) ) }
					<div className="odie-chatbox-bottom-edge" ref={ bottomRef }></div>
				</div>
				<OdieSendMessageButton bottomRef={ bottomRef } />
			</div>
		</div>
	);
};

export default OdieAssistant;
