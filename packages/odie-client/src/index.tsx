import { useEffect, useRef } from 'react';
import { MessagesContainer } from './components/message/messages-container';
import { OdieSendMessageButton } from './components/send-message-input';
import { useOdieAssistantContext, OdieAssistantProvider } from './context';
import useAutoScroll from './useAutoScroll';
import useLastMessageVisibility from './useLastMessageVisibility';

import './style.scss';

export const OdieAssistant: React.FC = () => {
	const { chat, trackEvent, currentUser } = useOdieAssistantContext();
	const containerRef = useRef< HTMLDivElement >( null );
	const messagesContainerRef = useRef< HTMLDivElement >( null );

	useEffect( () => {
		trackEvent( 'chatbox_view' );
	}, [ trackEvent ] );

	useAutoScroll( messagesContainerRef, chat.messages );
	useLastMessageVisibility( messagesContainerRef, chat.messages.length );

	return (
		<div className="chatbox">
			<div className="chat-box-message-container" ref={ containerRef } id="odie-messages-container">
				<MessagesContainer currentUser={ currentUser } ref={ messagesContainerRef } />
			</div>
			<OdieSendMessageButton containerReference={ messagesContainerRef } />
		</div>
	);
};

export default OdieAssistantProvider;
export { useOdieAssistantContext } from './context';
export { useSetOdieStorage, useGetOdieStorage } from './data';
export { EllipsisMenu } from './components/ellipsis-menu';
export { isOdieAllowedBot } from './utils/is-odie-allowed-bot';
export type { ZendeskConversation, ZendeskMessage } from './types/index';
