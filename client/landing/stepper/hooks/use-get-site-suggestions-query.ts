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
	onSuccess,
	refetchOnWindowFocus,
}: {
	params?: Record< string, unknown >;
	enabled: boolean;
	onSuccess?: ( response: SuggestionsResponse ) => void;
	refetchOnWindowFocus?: boolean;
} ) =>
	useQuery( {
		cacheTime: 0,
		queryFn: () => getSiteSuggestions( params ),
		refetchOnWindowFocus,
		enabled,
		onSuccess,
		queryKey: [ 'site-suggestions', params ],
		meta: {
			persist: false,
		},
	} );
