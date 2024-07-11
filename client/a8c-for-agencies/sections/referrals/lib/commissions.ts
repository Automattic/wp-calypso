import type { Referral } from '../types';
import type { APIProductFamilyProduct } from 'calypso/state/partner-portal/types';

export const getProductCommissionPercentage = ( product?: APIProductFamilyProduct ) => {
	if ( ! product ) {
		return 0;
	}
	if ( [ 'wpcom-hosting', 'pressable-hosting' ].includes( product.family_slug ) ) {
		return 0.2;
	}
	if (
		product.family_slug.startsWith( 'jetpack-' ) ||
		product.family_slug.startsWith( 'woocommerce-' )
	) {
		return 0.5;
	}
	return 0;
};

export const calculateCommissions = ( referral: Referral, products: APIProductFamilyProduct[] ) => {
	return referral.purchases
		.filter( ( purchase ) => [ 'pending', 'active' ].includes( purchase.status ) )
		.map( ( purchase ) => {
			const product = products.find( ( product ) => product.product_id === purchase.product_id );
			const commissionPercentage = getProductCommissionPercentage( product );
			const totalCommissions = product?.amount
				? Number( product.amount ) * commissionPercentage
				: 0;
			return totalCommissions;
		} )
		.reduce( ( acc, current ) => acc + current, 0 );
};

export const getConsolidatedData = (
	referrals: Referral[],
	products: APIProductFamilyProduct[]
) => {
	const consolidatedData = {
		allTimeCommissions: 0,
		pendingOrders: 0,
		pendingCommission: 0,
	};

	referrals.forEach( ( referral ) => {
		const commissions = calculateCommissions( referral, products );
		consolidatedData.pendingOrders += referral.statuses.filter(
			( status ) => status === 'pending'
		).length;
		consolidatedData.pendingCommission += commissions;
	} );

	return consolidatedData;
};
