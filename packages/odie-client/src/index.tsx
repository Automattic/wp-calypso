import { HelpCenterSelect } from '@automattic/data-stores';
import { HELP_CENTER_STORE } from '@automattic/help-center/src/stores';
import { useSelect } from '@wordpress/data';
import clsx from 'clsx';
import { useEffect } from 'react';
import { ClosedConversationFooter } from './components/closed-conversation-footer';
import { MessagesContainer } from './components/message/messages-container';
import { OdieSendMessageButton } from './components/send-message-input';
import { useOdieAssistantContext, OdieAssistantProvider } from './context';

import './style.scss';

export const OdieAssistant: React.FC = () => {
	const { trackEvent, shouldUseHelpCenterExperience, currentUser } = useOdieAssistantContext();
	const { currentSupportInteraction } = useSelect( ( select ) => {
		const store = select( HELP_CENTER_STORE ) as HelpCenterSelect;
		return {
			currentSupportInteraction: store.getCurrentSupportInteraction(),
		};
	}, [] );

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
			{ currentSupportInteraction?.status !== 'closed' && <OdieSendMessageButton /> }
			{ currentSupportInteraction?.status === 'closed' && <ClosedConversationFooter /> }
		</div>
	);
};

export default OdieAssistantProvider;
export { useOdieAssistantContext } from './context';
export { EllipsisMenu } from './components/ellipsis-menu';
export type { ZendeskConversation, ZendeskMessage, SupportInteraction } from './types';
