import { APIProductFamilyProduct } from 'calypso/state/partner-portal/types';
import { getProductCommissionPercentage } from './commissions';
import { getDailyPrice } from './get-estimated-commission';
import type { Referral } from '../types';

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

			// Calculate commission amount based on commission data or legacy calculation
			let commissionAmount = 0;
			if ( purchase.commissions ) {
				// New BD-based purchases have pre-calculated commissions
				commissionAmount =
					( purchase.commissions.estimated_commission_current_quarter ?? 0 ) +
					( purchase.commissions.estimated_commission_previous_quarter ?? 0 );
			} else {
				// Legacy calculation: use daily price * commission percentage
				// This is a simplified calculation for display purposes
				commissionAmount = ( dailyPrice * commissionPercentage ) / 100;
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
