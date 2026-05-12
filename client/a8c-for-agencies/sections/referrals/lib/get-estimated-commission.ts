import { APIProductFamilyProduct } from '../../../../state/partner-portal/types';
import { Referral } from '../types';

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
	const { commissions } = referrals.reduce(
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
					acc.commissions += commissionAmount;
				}
			}
			return acc;
		},
		{ commissions: 0 }
	);

	// Convert commission from cents to dollars,
	// add subscriptions commission and round to 2 decimal places
	const totalCommission = Number( commissions.toFixed( 2 ) );

	return totalCommission;
};
