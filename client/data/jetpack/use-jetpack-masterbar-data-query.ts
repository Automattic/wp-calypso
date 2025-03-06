import { useQuery } from '@tanstack/react-query';
import wpcom from 'calypso/lib/wp';
import type { UseQueryResult } from '@tanstack/react-query';

export type MenuItem = {
	id: string;
	menu_order: number;
	label: string;
	tagline: string;
	href: string;
	items: { [ key: number ]: MenuItem };
};

type MasterbarData = {
	sections: { [ key: number ]: MenuItem };
	bundles: MenuItem;
};

const useJetpackMasterbarDataQuery = (): UseQueryResult< MasterbarData > => {
	const queryKey = [ 'jetpack-masterbar-data' ];

	return useQuery( {
		queryKey,
		queryFn: () =>
			wpcom.req.get( {
				path: '/jetpack-marketing/jetpack-menu',
				apiNamespace: 'wpcom/v2',
			} ),
		refetchOnWindowFocus: false,
	} );
};

export default useJetpackMasterbarDataQuery;
