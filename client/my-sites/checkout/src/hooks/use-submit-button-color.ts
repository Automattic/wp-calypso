import { useQuery } from '@tanstack/react-query';
import wp from 'calypso/lib/wp';

interface SubmitButtonColorResponse {
	color: string;
}

function fetchSubmitButtonColor(): Promise< SubmitButtonColorResponse > {
	return wp.req.get( {
		path: '/submit-button-color',
		apiNamespace: 'wpcom/v2',
	} );
}

/**
 * Fetches the submit button background color from the API.
 * Returns null while loading or when an error occurs so the button retains its default styling.
 */
export function useSubmitButtonColor(): string | null {
	const { data, isLoading, error } = useQuery< SubmitButtonColorResponse >( {
		queryKey: [ 'checkout', 'submit-button-color' ],
		queryFn: fetchSubmitButtonColor,
	} );

	if ( isLoading || error || ! data?.color ) {
		return null;
	}

	return data.color;
}
