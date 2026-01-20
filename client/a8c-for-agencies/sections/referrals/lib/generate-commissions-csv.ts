import { APIProductFamilyProduct } from 'calypso/state/partner-portal/types';
import { getProductCommissionPercentage } from './commissions';
import { getDailyPrice } from './get-estimated-commission';
import {
	getCurrentCycleActivityWindow,
	getNextPayoutDateActivityWindow,
	areNextAndCurrentPayoutDatesEqual,
} from './get-next-payout-date';
import type { Referral, ReferralPurchase } from '../types';

/**
 * Escapes a value for CSV format.
 * Wraps in quotes if the value contains commas, quotes, or newlines.
 * Doubles any existing quotes.
 */
function csvEscape( value: unknown ): string {
	const str = value == null ? '' : String( value );
	const needsQuotes = /[",\n]/.test( str );
	const escaped = str.replace( /"/g, '""' );
	return needsQuotes ? `"${ escaped }"` : escaped;
}

/**
 * Formats a date string for CSV output.
 */
function formatDate( dateString: string | null ): string {
	if ( ! dateString ) {
		return '';
	}
	const date = new Date( dateString );
	return date.toISOString().split( 'T' )[ 0 ];
}

/**
 * Formats commission percentage for display.
 */
function formatPercentage( percentage: number ): string {
	return `${ ( percentage * 100 ).toFixed( 0 ) }%`;
}

/**
 * Calculates the estimated commission for a single purchase within an activity window.
 * This mirrors the calculation in get-estimated-commission.ts but for a single purchase.
 */
function calculatePurchaseCommission(
	purchase: ReferralPurchase,
	product: APIProductFamilyProduct,
	activityWindow: { start: Date; finish: Date },
	usePreviousQuarter: boolean
): number {
	if ( purchase.commissions ) {
		// BD-based purchases have pre-calculated commissions
		return usePreviousQuarter
			? purchase.commissions.estimated_commission_previous_quarter ?? 0
			: purchase.commissions.estimated_commission_current_quarter ?? 0;
	}

	// Legacy calculation based on active days within activity window
	const issuedDate = new Date( purchase.license.issued_at );
	issuedDate.setHours( 0, 0, 0, 0 );

	const revokedAt = purchase.license.revoked_at ? new Date( purchase.license.revoked_at ) : null;

	// Start date is the latest of the license issued date and activity window start
	const start = Math.max( issuedDate.getTime(), activityWindow.start.getTime() );
	// Finish date is the earliest of the license revoked date and activity window finish
	const finish = Math.min(
		revokedAt ? revokedAt.getTime() : Infinity,
		activityWindow.finish.getTime()
	);

	// Total days is the difference between finish and start dates in days
	const totalDays = Math.floor( ( finish - start ) / ( 1000 * 60 * 60 * 24 ) ) + 1;

	if ( totalDays < 1 ) {
		return 0;
	}

	const dailyPrice = getDailyPrice( product, purchase.quantity );
	const commissionPercentage = getProductCommissionPercentage( product.family_slug );

	// Return commission in dollars (dailyPrice is in cents)
	return ( dailyPrice * totalDays * commissionPercentage ) / 100;
}

interface CommissionRow {
	clientEmail: string;
	productName: string;
	quantity: number;
	issuedDate: string;
	revokedDate: string;
	dailyPrice: string;
	commissionPercentage: string;
	commissionAmount: string;
}

/**
 * Generates a CSV string with commission details for all referral purchases.
 * Only includes commission-eligible purchases (active and cancelled status).
 * Commission amounts are calculated using the same activity window logic as the
 * "Estimated commissions" column, combining both previous and current quarter commissions.
 */
export function generateCommissionsCsv(
	referrals: Referral[],
	products: APIProductFamilyProduct[]
): string {
	const headers = [
		'Client Email',
		'Product Name',
		'Quantity',
		'Issued Date',
		'Revoked Date',
		'Daily Price (USD)',
		'Commission %',
		'Commission Amount (USD)',
	];

	const rows: CommissionRow[] = [];

	// Get activity windows for commission calculation
	const currentDate = new Date();
	const previousQuarterWindow = getNextPayoutDateActivityWindow( currentDate );
	const currentQuarterWindow = getCurrentCycleActivityWindow( currentDate );
	const samePayoutDates = areNextAndCurrentPayoutDatesEqual( currentDate );

	for ( const referral of referrals ) {
		if ( ! referral?.purchases?.length ) {
			continue;
		}

		for ( const purchase of referral.purchases ) {
			// Only include active and cancelled purchases (commission-eligible)
			if ( ! purchase || purchase.status === 'pending' || purchase.status === 'error' ) {
				continue;
			}

			const product = products.find( ( p ) => purchase.product_id === p.product_id );
			if ( ! product ) {
				continue;
			}

			const commissionPercentage = getProductCommissionPercentage( product.family_slug );

			// Skip products with 0% commission
			if ( commissionPercentage === 0 ) {
				continue;
			}

			const dailyPrice = getDailyPrice( product, purchase.quantity );

			// Calculate commission amount using the same logic as "Estimated commissions" column
			// This combines both previous quarter and current quarter commissions
			let commissionAmount = 0;

			if ( samePayoutDates ) {
				// When payout dates are equal, only use previous quarter commission
				commissionAmount = calculatePurchaseCommission(
					purchase,
					product,
					previousQuarterWindow,
					true
				);
			} else {
				// Combine both quarters' commissions
				const previousQuarterCommission = calculatePurchaseCommission(
					purchase,
					product,
					previousQuarterWindow,
					true
				);
				const currentQuarterCommission = calculatePurchaseCommission(
					purchase,
					product,
					currentQuarterWindow,
					false
				);
				commissionAmount = previousQuarterCommission + currentQuarterCommission;
			}

			rows.push( {
				clientEmail: referral.client.email,
				productName: product.name,
				quantity: purchase.quantity,
				issuedDate: formatDate( purchase.license?.issued_at ),
				revokedDate: formatDate( purchase.license?.revoked_at ),
				dailyPrice: ( dailyPrice / 100 ).toFixed( 2 ),
				commissionPercentage: formatPercentage( commissionPercentage ),
				commissionAmount: commissionAmount.toFixed( 2 ),
			} );
		}
	}

	// Build CSV content
	const csvLines: string[] = [];
	csvLines.push( headers.map( csvEscape ).join( ',' ) );

	for ( const row of rows ) {
		const line = [
			row.clientEmail,
			row.productName,
			row.quantity,
			row.issuedDate,
			row.revokedDate,
			row.dailyPrice,
			row.commissionPercentage,
			row.commissionAmount,
		]
			.map( csvEscape )
			.join( ',' );
		csvLines.push( line );
	}

	return csvLines.join( '\n' );
}
