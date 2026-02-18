import { APIProductFamilyProduct } from '../../../../state/partner-portal/types';
import { Referral } from '../types';
import { getProductCommissionPercentage } from './commissions';

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
	activityWindow: { start: Date; finish: Date },
	usePreviousQuarter: boolean = false
) => {
	const { bdCommissions, legacyCommissionsInCents } = referrals.reduce(
		( acc, referral ) => {
			if ( ! referral?.purchases?.length ) {
				return acc;
			}
			for ( const purchase of referral.purchases ) {
				// We go over 'active' and 'cancelled' subscriptions
				if ( ! purchase || purchase.status === 'pending' || purchase.status === 'error' ) {
					continue;
				}
				if ( purchase.commissions ) {
					// As of Aug 2025, new client purchases will use BD for purchases
					// In this case the estimated commission has already been calculated on the backend
					// and we just need to add it to the total commission
					const commissionAmount = usePreviousQuarter
						? purchase.commissions.estimated_commission_previous_quarter ?? 0
						: purchase.commissions.estimated_commission_current_quarter ?? 0;
					acc.bdCommissions += commissionAmount;
				} else {
					// Legacy approach, but we need to keep it to continue working with old data
					// Calculate commission using the license data

					// For legacy calculations, we need to find the corresponding product
					const product = products.find(
						( product ) => purchase.product_id === product.product_id
					);
					if ( ! product ) {
						continue;
					}

					// Day the license was issued
					const issuedDate = new Date( purchase.license.issued_at );
					// Set hours to 0 to compare from start of the day
					issuedDate.setHours( 0, 0, 0, 0 );

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
					// We add 1 to include end-to-end days
					const totalDays = Math.floor( ( finish - start ) / ( 1000 * 60 * 60 * 24 ) ) + 1;

					if ( totalDays < 1 ) {
						continue;
					}

					const dailyPrice = getDailyPrice( product, purchase.quantity );

					// Get commission percentage for the product (common for both subscription and license)
					const commissionPercentage = getProductCommissionPercentage(
						product.slug,
						product.family_slug
					);

					// Add commission to the total commission (in cents)
					acc.legacyCommissionsInCents += dailyPrice * totalDays * commissionPercentage;
				}
			}
			return acc;
		},
		{ bdCommissions: 0, legacyCommissionsInCents: 0 }
	);

	// Convert commission from cents to dollars,
	// add subscriptions commission and round to 2 decimal places
	const totalCommission = Number( ( bdCommissions + legacyCommissionsInCents / 100 ).toFixed( 2 ) );

	return totalCommission;
};
