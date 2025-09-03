import { isTestModeEnvironment } from '@automattic/zendesk-client';
import { useMutation } from '@tanstack/react-query';
import { handleSupportInteractionsFetch } from './handle-support-interactions-fetch';
import type { SupportInteraction, SupportInteractionEvent } from '../types';

/**
 * Manage support interaction events.
 */
export const useManageSupportInteraction = () => {
	const isTestMode = isTestModeEnvironment();
	/**
	 * Start a new support interaction.
	 */
	const startNewInteraction = useMutation( {
		mutationKey: [ 'support-interaction', 'new-conversation', isTestMode ],
		mutationFn: ( eventData: SupportInteractionEvent ) =>
			handleSupportInteractionsFetch(
				'POST',
				null,
				isTestMode,
				eventData
			) as unknown as Promise< SupportInteraction >,
	} );

	/**
	 * Add an event to a support interaction.
	 */
	const addEventToInteraction = useMutation<
		SupportInteraction,
		Error,
		{ interactionId: string; eventData: SupportInteractionEvent }
	>( {
		mutationKey: [ 'support-interaction', 'add-event', isTestMode ],
		mutationFn: ( {
			interactionId,
			eventData,
		}: {
			interactionId: string;
			eventData: SupportInteractionEvent;
		} ) =>
			handleSupportInteractionsFetch(
				'POST',
				`/${ interactionId }/events`,
				isTestMode,
				eventData
			) as unknown as Promise< SupportInteraction >,
	} );

	/**
	 * Resolve a support interaction.
	 */
	const resolveInteraction = useMutation( {
		mutationKey: [ 'support-interaction', 'resolve', isTestMode ],
		mutationFn: ( { interactionId }: { interactionId: string } ) =>
			handleSupportInteractionsFetch( 'PUT', `/${ interactionId }/status`, isTestMode, {
				status: 'resolved',
			} ),
	} ).mutate;

	return {
		startNewInteraction: startNewInteraction.mutateAsync,
		isMutating: startNewInteraction.isPending,
		addEventToInteraction,
		resolveInteraction,
	};
};
