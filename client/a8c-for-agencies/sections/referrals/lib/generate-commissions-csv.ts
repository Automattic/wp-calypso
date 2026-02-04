import { APIProductFamilyProduct } from 'calypso/state/partner-portal/types';
import { getProductCommissionPercentage } from './commissions';
import type {
	Referral,
	ReferralCommissionPayoutClient,
	ReferralCommissionPayoutResponse,
	ReferralPurchase,
} from '../types';

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
	quantity: number | '-';
	invoicedDate: string;
	issuedDate: string | '-';
	revokedDate: string | '-';
	price: number;
	commissionPercentage: string;
	commissionAmount: number;
}

/**
 * Finds a referral and purchase matching the API client and product for supplemental fields.
 */
function findMatchingPurchase(
	referrals: Referral[],
	apiClient: ReferralCommissionPayoutClient,
	productId: number,
	products: APIProductFamilyProduct[]
): { referral: Referral; purchase: ReferralPurchase; product: APIProductFamilyProduct } | null {
	const referral = referrals.find(
		( r ) =>
			r.client.id === apiClient.client_user_id ||
			r.client.email?.toLowerCase() === apiClient.email?.toLowerCase()
	);
	if ( ! referral?.purchases?.length ) {
		return null;
	}
	const purchase = referral.purchases.find( ( p ) => p.product_id === productId );
	if ( ! purchase || purchase.status === 'pending' || purchase.status === 'error' ) {
		return null;
	}
	if ( ! purchase ) {
		return null;
	}
	const product = products.find( ( p ) => p.product_id === productId );
	if ( ! product ) {
		return null;
	}
	return { referral, purchase, product };
}

/**
 * Builds CSV rows from the referral commission payout API (commission from API, rest from referrals when available).
 * Creates one row per invoice.
 */
function buildRowsFromApi(
	referralCommissionPayout: ReferralCommissionPayoutResponse,
	referrals: Referral[],
	products: APIProductFamilyProduct[]
): CommissionRow[] {
	const rows: CommissionRow[] = [];

	for ( const apiClient of referralCommissionPayout.client_data ) {
		for ( const apiProduct of apiClient.products ) {
			const match = findMatchingPurchase( referrals, apiClient, apiProduct.product_id, products );

			if ( apiProduct.invoices && apiProduct.invoices.length > 0 ) {
				const clientEmail = apiClient.client_user_id === 'N/A' ? 'N/A' : apiClient.email;
				const productName = apiProduct.product_name;
				for ( const invoice of apiProduct.invoices ) {
					const invoicedDate = formatDate( invoice.payment_date );
					const price = invoice.paid_amount;
					const commissionAmount = invoice.commission_amount;
					if ( match ) {
						rows.push( {
							clientEmail,
							productName,
							quantity: match.purchase.quantity ?? 1,
							invoicedDate,
							issuedDate: formatDate( match.purchase.license?.issued_at ?? null ) || '-',
							revokedDate: formatDate( match.purchase.license?.revoked_at ?? null ) || '-',
							price,
							commissionPercentage: formatPercentage(
								getProductCommissionPercentage( match.product.slug, match.product.family_slug )
							),
							commissionAmount,
						} );
					} else if ( apiClient.client_user_id === 'N/A' ) {
						rows.push( {
							clientEmail,
							productName,
							quantity: '-',
							invoicedDate,
							issuedDate: '-',
							revokedDate: '-',
							price,
							commissionPercentage: '-',
							commissionAmount,
						} );
					}
				}
			}
		}
	}

	return rows;
}

/**
 * Generates a CSV string with commission details from the referral commission payout API only.
 * Commission and client/product data come from the endpoint; supplemental fields (quantity, dates, etc.) from matching referral/purchase data when available.
 * Returns CSV with headers only when no API data is provided.
 */
export function generateCommissionsCsv(
	referrals: Referral[],
	products: APIProductFamilyProduct[],
	referralCommissionPayout?: ReferralCommissionPayoutResponse,
	isSingleClient?: boolean
): string {
	const headers = [
		...( isSingleClient ? [] : [ 'Client Email' ] ),
		'Product Name',
		'Quantity',
		'Invoiced Date',
		'Issued Date',
		'Revoked Date',
		'Price (USD)',
		'Commission %',
		'Commission Amount (USD)',
	];

	const rows = referralCommissionPayout?.client_data?.length
		? buildRowsFromApi( referralCommissionPayout, referrals, products )
		: [];

	const csvLines: string[] = [];
	csvLines.push( headers.map( csvEscape ).join( ',' ) );

	for ( const row of rows ) {
		const line = [
			...( isSingleClient ? [] : [ row.clientEmail ] ),
			row.productName,
			row.quantity,
			row.invoicedDate,
			row.issuedDate,
			row.revokedDate,
			row.price,
			row.commissionPercentage,
			row.commissionAmount,
		]
			.map( csvEscape )
			.join( ',' );
		csvLines.push( line );
	}

	return csvLines.join( '\n' );
}
