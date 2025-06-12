import { recordTracksEvent } from '@automattic/calypso-analytics';
import { getConversationIdFromInteraction } from '@automattic/odie-client/src/utils';
import Smooch from 'smooch';
import type { ContactOption } from '../types';
import type {
	OdieConversation,
	OdieMessage,
	SupportInteraction,
	ZendeskConversation,
	ZendeskMessage,
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

/**
 * Returns the last message from a conversation.
 * @returns The last message or null if there are no messages.
 */
export const getLastMessage = ( {
	conversation,
}: {
	conversation: OdieConversation | ZendeskConversation;
} ): OdieMessage | ZendeskMessage | null => {
	if ( ! Array.isArray( conversation?.messages ) ) {
		return null;
	}

	const filteredMessages = conversation.messages.filter( ( message ) => message.type !== 'form' );
	return filteredMessages.length > 0 ? filteredMessages[ filteredMessages.length - 1 ] : null;
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

export const isMessageRated = ( message: ZendeskMessage ) => {
	return message.type === 'form';
};

export const getFeedbackPlaceholderMessage = ( message: ZendeskMessage ): ZendeskMessage => {
	return {
		role: message.role,
		id: message.id,
		type: 'text',
		text: 'Thanks for your feedback.',
		metadata: {
			rated: true,
			placeholder: true,
		},
		displayName: message.displayName,
		received: message.received,
	};
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
