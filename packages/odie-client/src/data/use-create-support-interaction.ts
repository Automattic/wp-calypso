import { useMutation } from '@tanstack/react-query';
import { handleSupportInteractionsFetch } from './handle-support-interactions-fetch';
import { useGetSupportInteractions } from './use-get-support-interactions';
import type { SupportInteractionEvent, SupportInteraction } from '../types/';

/**
 * Create a new support interaction event.
 * If the event already exists, return the current event.
 * If there is already an interaction, add the event to the interaction.
 * @param eventData - The event data.
 * @param currentEventId optional - The current event ID.
 * @returns The mutation function.
 */
export const useCreateSupportInteraction = (
	eventData: SupportInteractionEvent,
	currentEventId?: number
) => {
	// Get the current interaction if it exists
	const { data: currentInteraction } = useGetSupportInteractions(
		currentEventId,
		!! currentEventId
	);

	// Check if the new event already exists
	const { data: currentEvent } = useGetSupportInteractions( eventData.event_external_id );

	const supportInteractionUuid = ( currentInteraction as SupportInteraction )?.uuid ?? null;
	const path = supportInteractionUuid ? `/${ supportInteractionUuid }/events` : '';

	const createEvent = useMutation( {
		mutationKey: [
			'support-interaction',
			'new-event',
			eventData.event_external_id,
			supportInteractionUuid,
		],
		mutationFn: () => {
			return handleSupportInteractionsFetch( 'POST', path, eventData );
		},
	} );

	if ( currentEvent ) {
		return async () => currentEvent;
	}

	return createEvent.mutateAsync;
};
