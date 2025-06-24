import type { Referral } from '../types';
import type { APIProductFamilyProduct } from 'calypso/state/partner-portal/types';

export const isProductEligibleForCommission = ( slug: string ) => {
	const thirdPartyProducts = [
		'woocommerce-affirm',
		'woocommerce-afterpay',
		'woocommerce-constellation',
		'woocommerce-dynamic-pricing',
		'woocommerce-klarna',
		'woocommerce-klaviyo',
		'woocommerce-mollie',
		'woocommerce-paypal',
		'woocommerce-rental-products',
		'woocommerce-smart-coupons',
		'woocommerce-square',
		'woocommerce-stripe',
		'woocommerce-variation-swatches-and-photos',
	];

	if ( thirdPartyProducts.includes( slug ) ) {
		return false;
	}
	return true;
};

export const getProductCommissionPercentage = ( slug?: string ) => {
	if ( ! slug || ! isProductEligibleForCommission( slug ) ) {
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
