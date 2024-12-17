import { APIProductFamilyProduct } from '../../../../state/partner-portal/types';
import { Referral } from '../types';
import { getNextPayoutDateActivityWindow } from './get-next-payout-date';

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

export const getDailyPrice = ( product: APIProductFamilyProduct, quantity: number ) => {
	// If quantity is not 1 than we search corresponding bundle
	if ( quantity !== 1 ) {
		return (
			product.supported_bundles.find( ( bundleProduct ) => quantity === bundleProduct.quantity )
				?.price_per_unit ?? 0
		);
	}
	// If quantity is 1 than we return price per unit
	return product.price_per_unit ?? 0;
};

export const getEstimatedCommission = (
	referrals: Referral[],
	products: APIProductFamilyProduct[],
	date: Date = new Date()
) => {
	const activityWindow = getNextPayoutDateActivityWindow( date );

	const totalCommissionInCents = referrals.reduce( ( acc, referral ) => {
		if ( ! referral?.purchases?.length ) {
			return acc;
		}
		for ( const purchase of referral.purchases ) {
			// We go over 'active' and 'cancelled' subscriptions
			if ( ! purchase || purchase.status === 'pending' ) {
				continue;
			}
			// Find corresponding product for price
			const product = products.find( ( product ) => purchase.product_id === product.product_id );
			if ( ! product ) {
				continue;
			}
			// Day the license was issued
			const issuedDate = new Date( purchase.license.issued_at );
			// Day the license was revoked if present
			const revokedAt = purchase.license.revoked_at
				? new Date( purchase.license.revoked_at )
				: null;

			// Start date is the latest of the license issued date and activity window start
			const start = Math.max( issuedDate.getTime(), activityWindow.start.getTime() );
			// Finish date is the earliest of the license revoked date and activity window finish
			const finish = Math.min(
				revokedAt ? revokedAt.getTime() : Infinity,
				activityWindow.finish.getTime()
			);
			// Total days is the difference between finish and start dates in days
			const totalDays = Math.floor( ( finish - start ) / ( 1000 * 60 * 60 * 24 ) );
			if ( totalDays < 1 ) {
				continue;
			}

			const dailyPrice = getDailyPrice( product, purchase.quantity );

			// Get commission percentage for the product
			const commissionPercentage = getProductCommissionPercentage( product.family_slug );

			// Calculate commission for the day
			acc += dailyPrice * totalDays * commissionPercentage;
		}
		return acc;
	}, 0 );

	// Convert commission to dollars and round
	const totalCommission = Number( ( totalCommissionInCents / 100 ).toFixed( 2 ) );

	return totalCommission;
};
