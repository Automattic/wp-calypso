import { useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useGetSupportInteractionById } from './use-get-support-interaction-by-id';

/**
 * Read the support interaction ID from a MemoryRouter search string.
 * @returns The support interaction ID, or `null` when the URL has none.
 */
export const getSupportInteractionIdFromSearch = ( search: string ): string | null => {
	const params = new URLSearchParams( search );
	// Adopt a new less generic ID with backwards compatibility.
	return params.get( 'id' ) || params.get( 'odieInteractionId' ) || null;
};

/**
 * Get the support interaction ID from the MemoryRouter search params.
 *
 * Every tab/window has its own MemoryRouter, so this identifies the chat *this*
 * tab is showing without any extra state.
 * @returns The support interaction ID, or `null` when the URL has none.
 */
export const useCurrentSupportInteractionId = () => {
	const { search } = useLocation();
	return getSupportInteractionIdFromSearch( search );
};

/**
 * Get the support interaction based in the MemoryRouter ID param.
 * @returns The support interaction.
 */
export const useCurrentSupportInteraction = () => {
	const navigate = useNavigate();
	const id = useCurrentSupportInteractionId();
	const query = useGetSupportInteractionById( id || null );

	useEffect( () => {
		// If the support interaction is not found, drop the id param to automatically create a new one.
		// This happens when jumping from staging to production.
		if ( id && query.status === 'error' ) {
			navigate( '/odie' );
		}
	}, [ query.status, navigate, id ] );

	return query;
};
