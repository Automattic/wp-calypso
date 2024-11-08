import { useEffect } from 'react';
import { MessagesContainer } from './components/message/messages-container';
import { OdieSendMessageButton } from './components/send-message-input';
import { useOdieAssistantContext, OdieAssistantProvider } from './context';

import './style.scss';

export const OdieAssistant: React.FC = () => {
	const { trackEvent, currentUser } = useOdieAssistantContext();

	useEffect( () => {
		trackEvent( 'chatbox_view' );
	}, [ trackEvent ] );

	return (
		<div className="chatbox">
			<div className="chat-box-message-container" id="odie-messages-container">
				<MessagesContainer currentUser={ currentUser } />
			</div>
			<OdieSendMessageButton />
		</div>
	);
};

export default OdieAssistantProvider;
export { useOdieAssistantContext } from './context';
export { useSetOdieStorage, useGetOdieStorage } from './data';
export { EllipsisMenu } from './components/ellipsis-menu';
export { isOdieAllowedBot } from './utils/is-odie-allowed-bot';
export type { ZendeskConversation, ZendeskMessage } from './types/index';
