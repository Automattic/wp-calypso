import { useQuery } from '@tanstack/react-query';
import { handleSupportInteractionsFetch } from './handle-support-interactions-fetch';
import type { SupportInteraction, SupportInteractionEvent } from '../types/';

/**
 * Get the support interaction.
 * If no id is provided, return all support interactions.
 * @param id optional - An ID of an EVENT such as Odie ID or Zendesk ID.
 * @returns The support interaction.
 */
export const useGetSupportInteractions = ( id?: number, enabled = true ) => {
	return useQuery( {
		queryKey: [ 'support-interactions', 'get-conversation', id ?? '' ],
		queryFn: () => handleSupportInteractionsFetch( 'GET' ) as Promise< SupportInteraction[] >,
		select: ( data: SupportInteraction[] ) => {
			if ( ! id ) {
				return data;
			}

			const supportInteraction = data.find( ( interaction: SupportInteraction ) => {
				return interaction.events.some(
					( event: SupportInteractionEvent ) => event.event_external_id === id
				);
			} );

			return supportInteraction;
		},
		refetchOnWindowFocus: false,
		refetchOnReconnect: false,
		enabled,
	} );
};
