import { HelpCenterSelect } from '@automattic/data-stores';
import { HELP_CENTER_STORE } from '@automattic/help-center/src/stores';
import { useUpdateZendeskUserFields } from '@automattic/zendesk-client';
import { useSelect } from '@wordpress/data';
import Smooch from 'smooch';
import { useOdieAssistantContext } from '../context';
import { useManageSupportInteraction } from '../data';
import { setHelpCenterZendeskConversationStarted } from '../utils';

export const useCreateZendeskConversation = (): ( () => Promise< void > ) => {
	const {
		selectedSiteId,
		setChatStatus,
		setWaitAnswerToFirstMessageFromHumanSupport,
		setChatProvider,
		chat,
	} = useOdieAssistantContext();
	const { currentSupportInteraction } = useSelect( ( select ) => {
		const store = select( HELP_CENTER_STORE ) as HelpCenterSelect;
		return {
			currentSupportInteraction: store.getCurrentSupportInteraction(),
		};
	}, [] );
	const { isPending: isSubmittingZendeskUserFields, mutateAsync: submitUserFields } =
		useUpdateZendeskUserFields();
	const { addEventToInteraction } = useManageSupportInteraction();
	const chatId = chat.odieId;
	const createConversation = async () => {
		if ( ! chatId || isSubmittingZendeskUserFields ) {
			return;
		}

		setChatStatus( 'transfer' );

		submitUserFields( {
			messaging_initial_message: '',
			messaging_site_id: selectedSiteId || null,
			messaging_ai_chat_id: chatId,
		} ).then( () => {
			Smooch.createConversation( {
				metadata: {
					odieChatId: chatId,
					createdAt: Date.now(),
					supportInteractionId: currentSupportInteraction!.uuid,
				},
			} ).then( ( conversation ) => {
				setChatProvider( 'zendesk' );
				setChatStatus( 'loaded' );
				setHelpCenterZendeskConversationStarted();
				setWaitAnswerToFirstMessageFromHumanSupport( true );
				addEventToInteraction( {
					interactionId: currentSupportInteraction!.uuid,
					eventData: { event_source: 'zendesk', event_external_id: conversation.id },
				} );
			} );
		} );
	};

	return createConversation;
};
