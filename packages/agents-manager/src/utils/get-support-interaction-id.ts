import type { SupportInteraction } from '@automattic/odie-client';

/**
 * Finds the support interaction ID (UUID) for a given conversation ID and event type.
 * @param type - The event source type to match ('odie' or 'zendesk')
 * @param id - The conversation ID to look up (e.g., odie chat_id or zendesk ticket ID)
 * @param supportInteractions - The list of support interactions to search through
 * @returns The ID (UUID) of the matching support interaction, or undefined if not found
 */
export default function getSupportInteractionId(
	type: 'odie' | 'zendesk',
	id: number,
	supportInteractions: SupportInteraction[]
): string | undefined {
	return supportInteractions.find( ( { events } ) =>
		events.some( ( e ) => e.event_external_id === String( id ) && e.event_source === type )
	)?.uuid;
}
