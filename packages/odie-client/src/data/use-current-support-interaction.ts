import { useEffect, useRef } from 'react';
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

	// Track the last id we navigated away from so we redirect at most once per id.
	const navigatedAwayFromId = useRef< string | null >( null );

	useEffect( () => {
		// If the support interaction can't be loaded, drop the id param to automatically create a
		// new one. This happens when jumping from staging to production, and when the interaction
		// fetch itself fails — e.g. 3rd-party cookies are blocked, which breaks the cross-origin
		// wpcom proxy request.
		//
		// The error can be persistent (a blocked-cookie fetch keeps failing), so guard on a ref:
		// without it, `navigate` re-runs on every render while `query.status` stays 'error',
		// pushing history endlessly until React throws "Maximum update depth exceeded".
		if ( id && query.status === 'error' && navigatedAwayFromId.current !== id ) {
			navigatedAwayFromId.current = id;
			navigate( '/odie' );
		}
	}, [ query.status, navigate, id ] );

	return query;
};
