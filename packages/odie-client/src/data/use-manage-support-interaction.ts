import { useMutation } from '@tanstack/react-query';
import { handleSupportInteractionsFetch } from './handle-support-interactions-fetch';
import type { SupportInteractionEvent } from '../types/';

/**
 * Manage support interaction events.
 */
export const useManageSupportInteraction = () => {
	/**
	 * Start a new support interaction.
	 */
	const startNewInteraction = useMutation( {
		mutationKey: [ 'support-interaction', 'new-conversation' ],
		mutationFn: ( eventData: SupportInteractionEvent ) =>
			handleSupportInteractionsFetch( 'POST', null, eventData ),
	} ).mutateAsync;

	/**
	 * Add an event to a support interaction.
	 */
	const addEventToInteraction = useMutation( {
		mutationKey: [ 'support-interaction', 'add-event' ],
		mutationFn: ( {
			interactionId,
			eventData,
		}: {
			interactionId: string;
			eventData: SupportInteractionEvent;
		} ) => handleSupportInteractionsFetch( 'POST', `/${ interactionId }/events`, eventData ),
	} ).mutateAsync;

	/**
	 * Resolve a support interaction.
	 */
	const resolveInteraction = useMutation( {
		mutationKey: [ 'support-interaction', 'resolve' ],
		mutationFn: ( { interactionId }: { interactionId: string } ) =>
			handleSupportInteractionsFetch( 'PUT', `/${ interactionId }/status`, { status: 'resolved' } ),
	} ).mutateAsync;

	return {
		startNewInteraction,
		addEventToInteraction,
		resolveInteraction,
	};
};
