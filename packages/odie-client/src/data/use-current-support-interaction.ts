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
	const id = new URLSearchParams( search ).get( 'id' );
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
