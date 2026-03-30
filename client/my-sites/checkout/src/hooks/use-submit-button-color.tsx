import { useQuery } from '@tanstack/react-query';
import wp from 'calypso/lib/wp';

export async function fetchSubmitButtonColor(): Promise< string | undefined > {
	const response = await wp.req.get( '/submit-button-color', {
		apiNamespace: 'wpcom/v2',
	} );
	if ( typeof response === 'string' ) {
		return response;
	}
	if ( response && typeof response.color === 'string' ) {
		return response.color;
	}
	return undefined;
}

/**
 * Fetches the submit button colour from the WPCOM API and returns it.
 * The colour is a CSS-compatible string (e.g. "red", "#ff0000").
 * Returns undefined while loading or if the request fails.
 */
export default function useSubmitButtonColor(): string | undefined {
	const { data } = useQuery< string | undefined, Error >( {
		queryKey: [ 'submit-button-color' ],
		queryFn: fetchSubmitButtonColor,
		// Treat API errors as non-fatal — fall back to the default theme colour.
		retry: false,
		staleTime: 5 * 60 * 1000, // 5 minutes
	} );

	return data;
}
