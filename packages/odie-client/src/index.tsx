import { HelpCenterSelect } from '@automattic/data-stores';
import { HELP_CENTER_STORE } from '@automattic/help-center/src/stores';
import { useDispatch, useSelect } from '@wordpress/data';
import { useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { ClosedConversationFooter } from './components/closed-conversation-footer';
import { MessagesContainer } from './components/message/messages-container';
import { OdieSendMessageButton } from './components/send-message-input';
import { useOdieAssistantContext, OdieAssistantProvider } from './context';
import { useGetSupportInteractionById } from './data';
import { interactionHasEnded } from './utils';

import './style.scss';

export const OdieAssistant: React.FC = () => {
	const { trackEvent, currentUser } = useOdieAssistantContext();
	const { setCurrentSupportInteraction } = useDispatch( HELP_CENTER_STORE );
	const { interactionId } = useParams();

	const { currentSupportInteraction } = useSelect( ( select ) => {
		const store = select( HELP_CENTER_STORE ) as HelpCenterSelect;
		return {
			currentSupportInteraction: store.getCurrentSupportInteraction(),
		};
	}, [] );

	const { data: loadedSupportInteraction } = useGetSupportInteractionById( interactionId ?? null );

	useEffect( () => {
		if ( interactionId && ! currentSupportInteraction && loadedSupportInteraction ) {
			setCurrentSupportInteraction( loadedSupportInteraction );
		}
	}, [
		interactionId,
		currentSupportInteraction,
		loadedSupportInteraction,
		setCurrentSupportInteraction,
	] );

	const showClosedConversationFooter = interactionHasEnded( currentSupportInteraction );

	useEffect( () => {
		trackEvent( 'chatbox_view' );
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [] );

	return (
		<div className="chatbox">
			<div className="chat-box-message-container" id="odie-messages-container">
				<MessagesContainer currentUser={ currentUser } />
			</div>
			{ showClosedConversationFooter ? <ClosedConversationFooter /> : <OdieSendMessageButton /> }
		</div>
	);
};

export default OdieAssistantProvider;
export { useOdieAssistantContext } from './context';
export { EllipsisMenu } from './components/ellipsis-menu';
export type {
	Conversations,
	OdieConversation,
	OdieMessage,
	SupportInteraction,
	ZendeskConversation,
	ZendeskMessage,
} from './types';
