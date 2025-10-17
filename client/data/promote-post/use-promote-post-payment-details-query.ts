import { useQuery } from '@tanstack/react-query';
import { useSelector } from 'react-redux';
import { requestDSP } from 'calypso/lib/promote-post';
import { getSelectedSiteId } from 'calypso/state/ui/selectors';

export type DetailedPayment = {
	id: number;
	payment_key: string;
	status: string;
	currency: string;
	total_with_credits: number;
	total_paid: number;
	payment_method: string;
	date: string;
	credits_used: number;
	campaigns: Array< {
		campaign_id: number;
		name: string;
		impressions: number;
		total: number;
		site_id: number;
	} >;
};
export const usePaymentDetailsQuery = ( paymentId: number ) => {
	const selectedSiteId = useSelector( getSelectedSiteId );

	return useQuery( {
		queryKey: [ 'promote-post-payment-details', selectedSiteId, paymentId ],
		queryFn: async () => {
			if ( selectedSiteId && paymentId ) {
				return await requestDSP< DetailedPayment >(
					selectedSiteId,
					`/payments/${ paymentId }`,
					'GET',
					undefined,
					'1.1'
				);
			}
			throw new Error( 'selectedSiteId or paymentId is undefined' );
		},
		enabled: !! selectedSiteId && !! paymentId,
		retryDelay: 3000,
		meta: {
			persist: false,
		},
	} );
};
