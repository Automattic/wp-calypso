import { useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useGetSupportInteractionById } from './use-get-support-interaction-by-id';
/**
 * Get the support interaction based in the MemoryRouter ID param.
 * @returns The support interaction.
 */
export const useCurrentSupportInteraction = () => {
	const { search } = useLocation();
	const navigate = useNavigate();
	const oldId = new URLSearchParams( search ).get( 'id' );
	// Adopt a new less generic ID with backwards compatibility.
	const newId = new URLSearchParams( search ).get( 'odieInteractionId' );
	const id = oldId || newId;
	const query = useGetSupportInteractionById( id || null );

	useEffect( () => {
		// If the support interaction is not found, drop the id param to automatically create a new one.
		// This happens when jumping from staging to production.
		if ( id && query.status === 'error' ) {
			navigate( '/odie' );
		}
	}, [ query, navigate, id ] );

	return query;
};
