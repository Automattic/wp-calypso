import { useQuery, UseQueryResult } from '@tanstack/react-query';
import wpcom from 'calypso/lib/wp';

export type MarketingBanner = {
	is_visible: boolean;
};

export const useMarketingBanner = (
	siteId: number,
	isEnabled = false
): UseQueryResult< MarketingBanner > => {
	const queryKey = [ 'marketing-banner', siteId ];

	return useQuery< MarketingBanner >( {
		queryKey,
		queryFn: () => {
			return wpcom.req.get( {
				path: `/sites/${ siteId }/marketing-banner`,
				apiNamespace: 'wpcom/v2',
			} );
		},
		enabled: isEnabled && !! siteId,
	} );
};
