import { useQuery, UseQueryResult } from '@tanstack/react-query';
import wpcom from 'calypso/lib/wp';

interface WooTheme {
	name: string;
	slug: string;
	version: string;
	is_ai_generated: boolean;
}

const useWooActiveThemeQuery = (
	siteId: number | null | undefined,
	isEnabled: boolean = true
): UseQueryResult< WooTheme > => {
	return useQuery( {
		queryKey: [ 'woocommerce', 'theme', siteId ],
		queryFn: async () =>
			wpcom.req.get( {
				path: `/sites/${ siteId }/woocommerce/active-theme`,
				apiNamespace: 'wpcom/v2',
			} ),
		refetchOnWindowFocus: false,
		enabled: isEnabled && !! siteId,
		staleTime: 1000 * 60 * 1, // 1 minutes
	} );
};

export default useWooActiveThemeQuery;
