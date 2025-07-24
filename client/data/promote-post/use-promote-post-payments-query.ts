import { useQuery } from '@tanstack/react-query';
import { useSelector } from 'react-redux';
import { requestDSP } from 'calypso/lib/promote-post';
import { getSelectedSiteId } from 'calypso/state/ui/selectors';

export type Payment = {
	id: number;
	order_key: string;
	status: string;
	currency: string;
	total: number;
	subtotal: number;
	payment_method?: string;
	date: string;
	credits_used: number;
	campaigns?: {
		campaign_id: number;
		campaign_name: string;
		impressions: number;
		subtotal: number;
		total: number;
	};
};

export const usePaymentsQuery = ( hasPaymentsEnabled: boolean, siteId?: number ) => {
	const selectedSiteId = useSelector( getSelectedSiteId );

	const urlPartial = siteId ? `/?siteId=${ siteId }` : '';
	return useQuery( {
		queryKey: [ 'promote-post-payments-siteid', selectedSiteId ],
		queryFn: async () => {
			if ( selectedSiteId ) {
				const { total, payments } = await requestDSP< {
					total: number;
					payments: Payment[];
				} >( selectedSiteId, `/payments${ urlPartial }`, 'GET', undefined, '1.1' );
				return {
					total: total,
					payments: payments,
				};
			}
			throw new Error( 'selectedSiteId is undefined' );
		},
		enabled: !! selectedSiteId && hasPaymentsEnabled,
		retryDelay: 3000,
		meta: {
			persist: false,
		},
	} );
};
