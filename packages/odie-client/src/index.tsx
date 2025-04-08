import { HelpCenterSelect } from '@automattic/data-stores';
import { HELP_CENTER_STORE } from '@automattic/help-center/src/stores';
import { useSelect } from '@wordpress/data';
import { useEffect, useRef } from 'react';
import { ClosedConversationFooter } from './components/closed-conversation-footer';
import { JumpToRecent } from './components/message/jump-to-recent';
import { MessagesContainer } from './components/message/messages-container';
import { ViewMostRecentOpenConversationNotice } from './components/odie-notice/view-most-recent-conversation-notice';
import { OdieSendMessageButton } from './components/send-message-input';
import { useOdieAssistantContext, OdieAssistantProvider } from './context';
import { interactionHasEnded } from './utils';

import './style.scss';

export const OdieAssistant: React.FC = () => {
	const { trackEvent, currentUser, chat } = useOdieAssistantContext();
	const messagesContainerRef = useRef< HTMLDivElement >( null );
	const { currentSupportInteraction } = useSelect( ( select ) => {
		const store = select( HELP_CENTER_STORE ) as HelpCenterSelect;
		return {
			currentSupportInteraction: store.getCurrentSupportInteraction(),
		};
	}, [] );

	const showClosedConversationFooter = interactionHasEnded( currentSupportInteraction );

	useEffect( () => {
		trackEvent( 'chatbox_view' );
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [] );

	return (
		<div className="chatbox">
			<div className="messages-wrapper">
				<MessagesContainer currentUser={ currentUser } ref={ messagesContainerRef } />
				<JumpToRecent containerReference={ messagesContainerRef } />
			</div>
			<div className="chatbox-footer">
				{ chat.provider === 'odie' && <ViewMostRecentOpenConversationNotice /> }
				{ showClosedConversationFooter ? <ClosedConversationFooter /> : <OdieSendMessageButton /> }
			</div>
		</div>
	);
};

export default OdieAssistantProvider;
export { useOdieAssistantContext } from './context';
export { EllipsisMenu } from './components/ellipsis-menu';
export { NewThirdPartyCookiesNotice } from './components/message/get-support';
export type { ZendeskConversation, ZendeskMessage, SupportInteraction } from './types';
