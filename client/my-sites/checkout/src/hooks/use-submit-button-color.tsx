import { useQuery } from '@tanstack/react-query';
import wp from 'calypso/lib/wp';

export async function fetchSubmitButtonColor(): Promise< string | undefined > {
	const response = await wp.req.get( '/submit-button-color', { apiNamespace: 'wpcom/v2' } );
	if ( typeof response === 'string' ) {
		return response;
	}
	if ( response && typeof response === 'object' && typeof response.color === 'string' ) {
		return response.color;
	}
	return undefined;
}

/**
 * Fetches the submit button color from the WPCOM endpoint.
 * Falls back to undefined (default theme color) on error or when not available.
 */
export default function useSubmitButtonColor(): string | undefined {
	const { data } = useQuery< string | undefined, Error >( {
		queryKey: [ 'submit-button-color' ],
		queryFn: fetchSubmitButtonColor,
		staleTime: 5 * 60 * 1000, // 5 minutes
		// Non-fatal: errors simply result in undefined (default theme color)
		retry: false,
	} );

	return data;
}
