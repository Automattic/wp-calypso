import { useQueryClient } from '@tanstack/react-query';
import { useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { ClosedConversationFooter } from './components/closed-conversation-footer';
import { MessagesContainer } from './components/message/messages-container';
import { OdieSendMessageButton } from './components/send-message-input';
import { useOdieAssistantContext, OdieAssistantProvider } from './context';
import { useManageSupportInteraction } from './data';
import { useCurrentSupportInteraction } from './data/use-current-support-interaction';
import { hasCSATMessage, interactionHasEnded } from './utils';

import './style.scss';

export const OdieAssistant: React.FC = () => {
	const { trackEvent, currentUser, chat, botNameSlug } = useOdieAssistantContext();
	const { data: currentSupportInteraction } = useCurrentSupportInteraction();
	const { search } = useLocation();
	const params = new URLSearchParams( search );
	const interactionId = params.get( 'id' );
	const queryClient = useQueryClient();
	const { startNewInteraction, isMutating: isStartingNewInteraction } =
		useManageSupportInteraction();
	const currentInteractionQuery = useCurrentSupportInteraction();
	const navigate = useNavigate();

	useEffect( () => {
		// If a user lands at /odie without an ID, we need to create a new support interaction and redirect to the new URL.
		if ( ! interactionId && ! isStartingNewInteraction ) {
			const newID = crypto.randomUUID();
			startNewInteraction( {
				event_source: 'help-center',
				event_external_id: newID,
				bot_slug: botNameSlug,
			} ).then( ( interaction ) => {
				const params = new URLSearchParams( search );
				params.set( 'id', interaction.uuid );
				navigate( `/odie?${ params.toString() }`, { replace: true } );
			} );
		}
	}, [
		interactionId,
		startNewInteraction,
		botNameSlug,
		navigate,
		search,
		queryClient,
		currentInteractionQuery,
		isStartingNewInteraction,
	] );

	const chatHasCSATMessage = hasCSATMessage( chat );
	const showClosedConversationFooter =
		chatHasCSATMessage || interactionHasEnded( currentSupportInteraction );

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
export type {
	Conversations,
	OdieConversation,
	OdieMessage,
	SupportInteraction,
	ZendeskConversation,
	ZendeskMessage,
} from './types';
