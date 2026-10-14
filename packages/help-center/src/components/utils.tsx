import { getConversationIdFromInteraction } from '@automattic/odie-client/src/utils';
import {
	getSurveyResponseRatingMetadataKey,
	getZendeskSurveyResponseId,
	isZendeskSurveyMessage,
	ZendeskConversation,
	ZendeskMessage,
} from '@automattic/zendesk-client';
import Smooch from 'smooch';
import type { OdieConversation, OdieMessage, SupportInteraction } from '@automattic/odie-client';

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
			isMatchingInteraction( interaction, conversation.metadata.supportInteractionId as string )
		)
	);
};

/**
 * Returns the first message from a conversation.
 * @returns The first message or null if there are no messages.
 */
export const getFirstMessage = ( {
	conversation,
}: {
	conversation: OdieConversation | ZendeskConversation;
} ): OdieMessage | ZendeskMessage | null => {
	if ( ! Array.isArray( conversation?.messages ) ) {
		return null;
	}

	const filteredMessages = conversation.messages.filter( ( message ) =>
		'type' in message ? message.type !== 'form' : true
	);

	return filteredMessages.length > 0 ? filteredMessages[ 0 ] : null;
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

	const filteredMessages = conversation.messages.filter( ( message ) =>
		'type' in message ? message.type !== 'form' : true
	);

	return filteredMessages.length > 0 ? filteredMessages[ filteredMessages.length - 1 ] : null;
};

export const getChatLinkFromConversation = (
	conversation: OdieConversation | ZendeskConversation
): string => {
	const chatParams = new URLSearchParams();
	const metadata = conversation.metadata;

	if ( metadata ) {
		// Logged out chats only have a sessionId and a botSlug (not support interaction id)
		if ( 'sessionId' in metadata && metadata.sessionId ) {
			chatParams.set( 'sessionId', metadata.sessionId.toString() );
		}

		if ( metadata.supportInteractionId ) {
			chatParams.set( 'id', metadata.supportInteractionId.toString() );
		}

		if ( metadata.botSlug ) {
			chatParams.set( 'botSlug', metadata.botSlug.toString() );
		}

		if ( metadata.odieChatId ) {
			chatParams.set( 'chatId', metadata.odieChatId.toString() );
		}
	}

	return `/odie?${ chatParams.toString() }`;
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

/**
 * Returns the rated outcome of a conversation's `zd:surveys` CSAT Survey Response, if it has one
 * and it's already been rated -- persisted on the conversation's own metadata by
 * useSurveyResponseRating (in @automattic/odie-client), keyed by survey_response_id.
 */
export const getZendeskSurveyRating = (
	conversation: OdieConversation | ZendeskConversation
): 'good' | 'bad' | undefined => {
	if ( ! Array.isArray( conversation.messages ) ) {
		return undefined;
	}

	const surveyMessage = ( conversation.messages as ( OdieMessage | ZendeskMessage )[] ).find(
		( message ): message is ZendeskMessage =>
			'source' in message && isZendeskSurveyMessage( message )
	);
	const surveyResponseId = surveyMessage?.actions?.[ 0 ]?.uri
		? getZendeskSurveyResponseId( surveyMessage.actions[ 0 ].uri )
		: null;

	if ( ! surveyResponseId ) {
		return undefined;
	}

	const rating = ( conversation as ZendeskConversation ).metadata?.[
		getSurveyResponseRatingMetadataKey( surveyResponseId )
	];

	return rating === 'good' || rating === 'bad' ? rating : undefined;
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
			isMatchingInteraction( interaction, conversation.metadata.supportInteractionId as string )
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
