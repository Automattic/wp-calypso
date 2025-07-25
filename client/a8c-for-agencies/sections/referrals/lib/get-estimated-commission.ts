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
	activityWindow: { start: Date; finish: Date }
) => {
	const { totalCommissionsFromSubscriptions, otherCommissionsInCents } = referrals.reduce(
		( acc, referral ) => {
			if ( ! referral?.purchases?.length ) {
				return acc;
			}
			for ( const purchase of referral.purchases ) {
				// We go over 'active' and 'cancelled' subscriptions
				if ( ! purchase || purchase.status === 'pending' || purchase.status === 'error' ) {
					continue;
				}
				// Find corresponding product for price
				const product = products.find( ( product ) => purchase.product_id === product.product_id );
				if ( ! product ) {
					continue;
				}

				// Get commission percentage for the product (common for both subscription and license)
				const commissionPercentage = getProductCommissionPercentage( product.family_slug );

				// Day the license was issued
				const issuedDate = new Date( purchase.license.issued_at );
				// Set hours to 0 to compare from start of the day
				issuedDate.setHours( 0, 0, 0, 0 );

				if ( purchase.subscription ) {
					// FIXME: We will need to find a better way to handle this
					if (
						issuedDate.getTime() < activityWindow.start.getTime() ||
						issuedDate.getTime() > activityWindow.finish.getTime()
					) {
						continue;
					}

					const totalPrice = Number( purchase.subscription.commissionable_amount ) ?? 0;

					// Add commission to subscription total (in dollars)
					acc.totalCommissionsFromSubscriptions += totalPrice * commissionPercentage;
				} else {
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

					// Add commission to the total commission (in cents)
					acc.otherCommissionsInCents += dailyPrice * totalDays * commissionPercentage;
				}
			}
			return acc;
		},
		{ totalCommissionsFromSubscriptions: 0, otherCommissionsInCents: 0 }
	);

	// Convert commission from cents to dollars,
	// add subscriptions commission and round to 2 decimal places
	const totalCommission = Number(
		( totalCommissionsFromSubscriptions + otherCommissionsInCents / 100 ).toFixed( 2 )
	);

	return totalCommission;
};
