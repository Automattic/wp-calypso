import { recordTracksEvent } from '@automattic/calypso-analytics';
import { getConversationIdFromInteraction } from '@automattic/odie-client/src/utils';
import Smooch from 'smooch';
import type { ContactOption } from '../types';
import type {
	OdieConversation,
	SupportInteraction,
	ZendeskConversation,
} from '@automattic/odie-client';

const isMatchingInteraction = (
	supportInteraction: SupportInteraction,
	supportInteractionId: string
): boolean => {
	return supportInteraction.uuid === supportInteractionId;
};

const filterConversationsBySupportInteractions = (
	conversations: ZendeskConversation[],
	supportInteractions: SupportInteraction[]
): ZendeskConversation[] => {
	return conversations.filter( ( conversation ) =>
		supportInteractions.some( ( interaction ) =>
			isMatchingInteraction( interaction, conversation.metadata.supportInteractionId )
		)
	);
};

export const generateContactOnClickEvent = (
	contactOption: ContactOption,
	contactOptionEventName?: string,
	isUserEligible?: boolean
) => {
	if ( contactOptionEventName ) {
		recordTracksEvent( contactOptionEventName, {
			location: 'help-center',
			contact_option: contactOption,
			is_user_eligible: isUserEligible,
		} );
	}
};

export const getLastMessage = ( {
	conversation,
}: {
	conversation: OdieConversation | ZendeskConversation;
} ) => {
	return Array.isArray( conversation.messages ) && conversation.messages.length > 0
		? conversation.messages[ conversation.messages.length - 1 ]
		: null;
};

export const getZendeskConversations = () => {
	try {
		const conversations = Smooch?.getConversations?.() ?? [];
		return conversations as unknown as ZendeskConversation[];
	} catch {
		// Smooch is not completely initialized yet
		return [];
	}
};

export const getClientId = ( conversations: ZendeskConversation[] ): string =>
	conversations
		.flatMap( ( conversation ) => conversation.messages )
		.find( ( message ) => message.source?.type === 'web' && message.source?.id )?.source?.id || '';

export const matchSupportInteractionId = (
	getConversations: () => ZendeskConversation[],
	isChatLoaded: boolean,
	currentSupportInteraction: SupportInteraction | undefined
) => {
	if ( currentSupportInteraction && isChatLoaded && getConversations ) {
		const conversations = getConversations();
		const currentConversationId = getConversationIdFromInteraction( currentSupportInteraction );
		return conversations.find( ( conversation ) => {
			return conversation.id === currentConversationId;
		} );
	}
};

export const filterAndUpdateConversationsWithStatus = (
	conversations: ZendeskConversation[],
	supportInteractions: SupportInteraction[]
) => {
	const filteredConversations = filterConversationsBySupportInteractions(
		conversations,
		supportInteractions
	);

	const conversationsWithUpdatedStatuses = filteredConversations.map( ( conversation ) => {
		const supportInteraction = supportInteractions.find( ( interaction ) =>
			isMatchingInteraction( interaction, conversation.metadata.supportInteractionId )
		);

		if ( ! supportInteraction ) {
			return conversation;
		}

		const updatedConversation = {
			...conversation,
			metadata: {
				...conversation.metadata,
				status: supportInteraction.status,
			},
		};

		return updatedConversation;
	} );

	return conversationsWithUpdatedStatuses;
};
