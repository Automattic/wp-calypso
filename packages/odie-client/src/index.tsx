import clsx from 'clsx';
import { useEffect } from 'react';
import { MessagesContainer } from './components/message/messages-container';
import { OdieSendMessageButton } from './components/send-message-input';
import { useOdieAssistantContext, OdieAssistantProvider } from './context';

import './style.scss';

export const OdieAssistant: React.FC = () => {
	const { trackEvent, shouldUseHelpCenterExperience, currentUser } = useOdieAssistantContext();

	useEffect( () => {
		trackEvent( 'chatbox_view' );
	}, [] );

	return (
		<div
			className={ clsx( 'chatbox', {
				'help-center-experience-enabled': shouldUseHelpCenterExperience,
				'help-center-experience-disabled': ! shouldUseHelpCenterExperience,
			} ) }
		>
			<div className="chat-box-message-container" id="odie-messages-container">
				<MessagesContainer currentUser={ currentUser } />
			</div>
			<OdieSendMessageButton />
		</div>
	);
};

export default OdieAssistantProvider;
export { useOdieAssistantContext } from './context';
export { EllipsisMenu } from './components/ellipsis-menu';
export type { ZendeskConversation, ZendeskMessage, SupportInteraction } from './types';
