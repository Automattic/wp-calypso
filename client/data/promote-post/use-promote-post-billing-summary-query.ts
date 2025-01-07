import { useQuery } from '@tanstack/react-query';
import { useSelector } from 'react-redux';
import { requestDSP } from 'calypso/lib/promote-post';
import { getSelectedSiteId } from 'calypso/state/ui/selectors';

export type OrderInfo = {
	date: string;
	amount: number;
	url: string;
};

const useBillingSummaryQuery = ( queryOptions = {} ) => {
	const selectedSiteId = useSelector( getSelectedSiteId );

	return useQuery( {
		queryKey: [ 'promote-post-billing-summary-siteid', selectedSiteId ],
		queryFn: async () => {
			if ( selectedSiteId ) {
				const { debt, paymentsBlocked, payment_links } = await requestDSP< {
					debt: string;
					paymentsBlocked: boolean;
					payment_links: OrderInfo[];
				} >( selectedSiteId, `/user/billing-summary` );
				return {
					debt: debt ? parseFloat( debt ).toFixed( 2 ) : undefined,
					paymentsBlocked: paymentsBlocked ? paymentsBlocked : false,
					paymentLinks: payment_links,
				};
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

export default useBillingSummaryQuery;
