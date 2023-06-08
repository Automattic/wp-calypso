import { useQuery } from '@tanstack/react-query';
import { useSelector } from 'react-redux';
import { requestDSP } from 'calypso/lib/promote-post';
import { getSelectedSiteId } from 'calypso/state/ui/selectors';

const useCreditBalanceQuery = ( queryOptions = {} ) => {
	const selectedSiteId = useSelector( getSelectedSiteId );

	return useQuery( {
		queryKey: [ 'promote-post-credit-balance-siteid', selectedSiteId ],
		queryFn: async () => {
			if ( typeof selectedSiteId === 'number' ) {
				const { balance } = await requestDSP< { balance: string } >(
					selectedSiteId,
					`/credits/balance`
				);
				return balance;
			}
			throw new Error( 'wpcomUserId is undefined' );
		},
		...queryOptions,
		enabled: !! selectedSiteId,
		retryDelay: 3000,
		meta: {
			persist: false,
		},
	} );
};

export default useCreditBalanceQuery;
