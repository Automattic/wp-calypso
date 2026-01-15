import { isTestModeEnvironment } from '@automattic/zendesk-client';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useOdieAssistantContext } from '../context';
import { handleSupportInteractionsFetch } from './handle-support-interactions-fetch';
import type { SupportInteraction, SupportInteractionEvent } from '../types';

/**
 * Manage support interaction events.
 */
export const useManageSupportInteraction = () => {
	const isTestMode = isTestModeEnvironment();
	const queryClient = useQueryClient();
	const { newInteractionsBotSlug } = useOdieAssistantContext();
	/**
	 * Start a new support interaction.
	 */
	const startNewInteraction = useMutation( {
		mutationKey: [ 'support-interaction', 'new-conversation', isTestMode, newInteractionsBotSlug ],
		mutationFn: ( eventData: SupportInteractionEvent ) =>
			handleSupportInteractionsFetch( 'POST', null, isTestMode, {
				...eventData,
				bot_slug: newInteractionsBotSlug,
			} ) as unknown as Promise< SupportInteraction >,
		onSuccess: ( interaction ) => {
			const isTestMode = isTestModeEnvironment();
			const queryKey = [
				'support-interactions',
				'get-interaction-by-id',
				interaction.uuid,
				isTestMode,
			];
			// Save the interaction to the query client to avoid a new API call.
			queryClient.setQueryData( queryKey, interaction );
			// Add the new interaction to the list of interactions without refetching them.
			queryClient.setQueryData(
				[ 'support-interactions', 'get-interactions', isTestMode ],
				( oldData: SupportInteraction[] ) => {
					const newData = [ ...oldData ];
					const index = newData.findIndex( ( i ) => i.uuid === interaction.uuid );
					if ( index !== -1 ) {
						newData[ index ] = interaction;
					} else {
						newData.push( interaction );
					}
					return newData;
				}
			);
		},
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
		onSuccess: ( interaction ) => {
			const isTestMode = isTestModeEnvironment();
			const queryKey = [
				'support-interactions',
				'get-interaction-by-id',
				interaction.uuid,
				isTestMode,
			];
			// Update the interaction with the new events.
			queryClient.setQueryData( queryKey, interaction );
			// The support history relies on the list of interactions to have fresh events.
			queryClient.setQueryData(
				[ 'support-interactions', 'get-interactions', isTestMode ],
				( oldData: SupportInteraction[] ) => {
					const newData = [ ...oldData ];
					const index = newData.findIndex( ( i ) => i.uuid === interaction.uuid );
					if ( index !== -1 ) {
						newData[ index ] = interaction;
					} else {
						newData.push( interaction );
					}
					return newData;
				}
			);
			// The support history relies on the list of odie-interactions to be fresh. Invalidate.
			queryClient.invalidateQueries( {
				queryKey: [ 'odie-interactions' ],
			} );
		},
	} );

	return {
		startNewInteraction: startNewInteraction.mutateAsync,
		isMutating: startNewInteraction.isPending,
		addEventToInteraction: addEventToInteraction.mutateAsync,
	};
};
