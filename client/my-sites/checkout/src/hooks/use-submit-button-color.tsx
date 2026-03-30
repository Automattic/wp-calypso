import { useQuery } from '@tanstack/react-query';
import wp from 'calypso/lib/wp';

export async function fetchSubmitButtonColor(): Promise< string | undefined > {
	try {
		const response = await wp.req.get( '/submit-button-color', { apiNamespace: 'wpcom/v2' } );
		if ( typeof response === 'string' ) {
			return response;
		}
		if ( response && typeof response === 'object' && typeof response.color === 'string' ) {
			return response.color;
		}
		return undefined;
	} catch {
		return undefined;
	}
}

/**
 * Fetches the submit button color from the WPCOM `/wpcom/v2/submit-button-color` endpoint.
 * Returns `undefined` on error or when no color is available (falls back to the default theme color).
 */
export default function useSubmitButtonColor(): string | undefined {
	const { data } = useQuery< string | undefined, Error >( {
		queryKey: [ 'submit-button-color' ],
		queryFn: fetchSubmitButtonColor,
		staleTime: 5 * 60 * 1000, // 5 minutes
	} );

	return data;
}
