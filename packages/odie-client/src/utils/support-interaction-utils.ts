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
