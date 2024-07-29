import { useQuery } from '@tanstack/react-query';
import wpcom from 'calypso/lib/wp';
import { SubscriptionAPIResponse, Subscription } from '../types';

const getClientSubscriptions = ( subscriptions: SubscriptionAPIResponse[] ) => {
	const products: Subscription[] = subscriptions.reduce( ( acc: Subscription[], curr ) => {
		curr.products.forEach( ( product ) => {
			acc.push( {
				...product,
				referral_id: curr.id,
				// id is a combination of referral_id and product_id because none of them are unique
				id: parseInt( `${ curr.id }${ product.product_id }` ),
			} );
		} );
		return acc;
	}, [] );
	return products;
};

export default function useFetchClientSubscriptions() {
	const data = useQuery( {
		queryKey: [ 'a4a-client-subscriptions' ],
		queryFn: () =>
			wpcom.req.get( {
				apiNamespace: 'wpcom/v2',
				path: '/agency-client/referrals',
			} ),
		refetchOnWindowFocus: false,
		select: getClientSubscriptions,
	} );

	return data;
}
