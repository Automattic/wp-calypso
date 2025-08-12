import type { SupportInteraction } from '../types';
export const interactionHasZendeskEvent = (
	supportInteraction: SupportInteraction | undefined
): boolean => {
	return !! supportInteraction?.events.find( ( event ) => event.event_source === 'zendesk' );
};

export const interactionHasEnded = (
	supportInteraction: SupportInteraction | undefined
): boolean => {
	return !! supportInteraction && [ 'solved', 'closed' ].includes( supportInteraction.status );
};

export const getConversationIdFromInteraction = (
	supportInteraction: SupportInteraction | undefined
) => {
	return supportInteraction?.events.find( ( event ) => event.event_source === 'zendesk' )
		?.event_external_id;
};
export const getOdieIdFromInteraction = (
	supportInteraction: SupportInteraction | undefined
): string | null => {
	return (
		supportInteraction?.events.find( ( event ) => event.event_source === 'odie' )
			?.event_external_id ?? null
	);
};
