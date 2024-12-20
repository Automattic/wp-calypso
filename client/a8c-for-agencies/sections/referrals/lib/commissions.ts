import type { Referral, ReferralInvoice } from '../types';
import type { APIProductFamilyProduct } from 'calypso/state/partner-portal/types';

export const getProductCommissionPercentage = ( slug?: string ) => {
	if ( ! slug ) {
		return 0;
	}
	if ( [ 'wpcom-hosting', 'pressable-hosting' ].includes( slug ) ) {
		return 0.2;
	}
	if ( slug.startsWith( 'jetpack-' ) || slug.startsWith( 'woocommerce-' ) ) {
		return 0.5;
	}
	return 0;
};

export const calculateCommissions = ( referral: Referral, products: APIProductFamilyProduct[] ) => {
	return referral.purchases
		.filter( ( purchase ) => [ 'pending', 'active' ].includes( purchase.status ) )
		.map( ( purchase ) => {
			const product = products.find( ( product ) => product.product_id === purchase.product_id );
			const commissionPercentage = getProductCommissionPercentage( product?.family_slug );
			const totalCommissions = product?.amount
				? Number( product.amount ) * commissionPercentage
				: 0;
			return totalCommissions;
		} )
		.reduce( ( acc, current ) => acc + current, 0 );
};

// TODO: Remove this file once we establish new commission logic works properly
export const getConsolidatedData = (
	referrals: Referral[],
	products: APIProductFamilyProduct[],
	invoices: ReferralInvoice[]
) => {
	const { totalAmountDue, totalAmountPaid } = invoices.reduce(
		( acc, invoice ) => {
			const total = invoice.products.reduce( ( acc, product ) => {
				const commissionPercentage = getProductCommissionPercentage( product.product_family_slug );
				const totalCommissions = product.amount
					? Number( product.amount ) * commissionPercentage
					: 0;
				return acc + totalCommissions;
			}, 0 );

			if ( invoice.isPaid ) {
				acc.totalAmountPaid += total;
			}
			if ( invoice.isDue ) {
				acc.totalAmountDue += total;
			}
			return acc;
		},
		{ totalAmountDue: 0, totalAmountPaid: 0 }
	);

	const consolidatedData = {
		allTimeCommissions: totalAmountPaid,
		pendingOrders: 0,
		pendingCommission: totalAmountDue,
	};

	referrals.forEach( ( referral ) => {
		const commissions = calculateCommissions( referral, products );
		consolidatedData.pendingOrders += referral.referralStatuses.filter(
			( status ) => status === 'pending'
		).length;
		consolidatedData.pendingCommission += commissions;
	} );

	return consolidatedData;
};
