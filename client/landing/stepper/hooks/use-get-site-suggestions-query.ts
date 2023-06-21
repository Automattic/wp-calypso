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

export const getSiteSuggestions = (): Promise< SuggestionsResponse > =>
	wpcom.req.get( {
		method: 'GET',
		apiNamespace: 'wpcom/v2',
		path: '/site-suggestions',
	} );

export const useGetSiteSuggestionsQuery = ( {
	enabled,
	onSuccess,
	refetchOnWindowFocus,
}: {
	enabled: boolean;
	onSuccess?: ( response: SuggestionsResponse ) => void;
	refetchOnWindowFocus?: boolean;
} ) =>
	useQuery( {
		cacheTime: 0,
		queryFn: getSiteSuggestions,
		refetchOnWindowFocus,
		enabled,
		onSuccess,
		queryKey: [ 'site-suggestions' ],
		meta: {
			persist: false,
		},
	} );
