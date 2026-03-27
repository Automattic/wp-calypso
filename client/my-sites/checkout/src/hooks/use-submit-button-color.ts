import { useQuery } from '@tanstack/react-query';
import wp from 'calypso/lib/wp';

async function fetchSubmitButtonColor(): Promise< string | null > {
	const response: unknown = await wp.req.get( '/submit-button-color' );
	if ( typeof response === 'string' ) {
		return response;
	}
	return null;
}

/**
 * Fetches the submit button color from the WPCOM API.
 * Returns the CSS-compatible color string, or null if unavailable.
 */
export default function useSubmitButtonColor(): string | null {
	const { data } = useQuery< string | null >( {
		queryKey: [ 'submit-button-color' ],
		queryFn: fetchSubmitButtonColor,
		staleTime: Infinity,
	} );

	return data ?? null;
}
