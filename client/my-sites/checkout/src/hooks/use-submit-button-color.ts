import { useQuery } from '@tanstack/react-query';
import wp from 'calypso/lib/wp';

async function fetchSubmitButtonColor(): Promise< string | undefined > {
	const response = await wp.req.get( '/submit-button-color' );
	if ( typeof response === 'string' ) {
		return response;
	}
	return undefined;
}

/**
 * Fetches the dynamic color for the checkout submit button from the WPCOM endpoint.
 * Returns undefined while loading or if the fetch fails.
 */
export default function useSubmitButtonColor(): string | undefined {
	const { data } = useQuery< string | undefined, Error >( {
		queryKey: [ 'submit-button-color' ],
		queryFn: fetchSubmitButtonColor,
	} );
	return data;
}
