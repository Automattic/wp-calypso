import { useQuery } from '@tanstack/react-query';
import wpcom from 'calypso/lib/wp';

type SuggestionsResponse =
	| {
			success: true;
			suggestions: { title: string }[];
	  }
	| {
			success: false;
	  };

export const getSiteSuggestions = (
	params?: Record< string, unknown >
): Promise< SuggestionsResponse > =>
	wpcom.req.get(
		{
			method: 'GET',
			apiNamespace: 'wpcom/v2',
			path: '/site-suggestions',
		},
		params
	);

export const useGetSiteSuggestionsQuery = ( {
	params,
	enabled,
	refetchOnWindowFocus,
}: {
	params?: Record< string, unknown >;
	enabled: boolean;
	refetchOnWindowFocus?: boolean;
} ) =>
	useQuery( {
		gcTime: 0,
		queryFn: () => getSiteSuggestions( params ),
		refetchOnWindowFocus,
		enabled,
		queryKey: [ 'site-suggestions', params ],
		meta: {
			persist: false,
		},
	} );
