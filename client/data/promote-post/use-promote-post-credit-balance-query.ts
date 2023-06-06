import { useQuery } from '@tanstack/react-query';
import { useSelector } from 'react-redux';
import { requestDSP } from 'calypso/lib/promote-post';
import { getCurrentUser } from 'calypso/state/current-user/selectors';

const useCreditBalanceQuery = ( queryOptions = {} ) => {
	const currentUser = useSelector( getCurrentUser );
	const wpcomUserId = currentUser?.ID;

	return useQuery( {
		queryKey: [ 'promote-post-credit-balance', wpcomUserId ],
		queryFn: async () => {
			if ( typeof wpcomUserId === 'number' ) {
				const { balance } = await requestDSP< { balance: string } >(
					wpcomUserId,
					`/credits/balance`
				);
				return balance;
			}
			throw new Error( 'wpcomUserId is undefined' );
		},
		...queryOptions,
		enabled: !! wpcomUserId,
		retryDelay: 3000,
		meta: {
			persist: false,
		},
	} );
};

export default useCreditBalanceQuery;
