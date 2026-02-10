import { APIProductFamilyProduct } from 'calypso/state/partner-portal/types';
import { getProductCommissionPercentage } from './commissions';
import type {
	Referral,
	ReferralCommissionPayoutClient,
	ReferralCommissionPayoutResponse,
	ReferralPurchase,
} from '../types';

/** CSV line ending per RFC 4180; CRLF ensures Excel and Windows tools parse rows correctly. */
const CSV_LINE_ENDING = '\r\n';

/** UTF-8 BOM so Excel opens the file with correct encoding. */
const UTF8_BOM = '\uFEFF';

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
 * Formats a date string for CSV output (YYYY-MM-DD).
 * Returns '-' for missing/invalid dates so the column is consistently aligned.
 */
function formatDate( dateString: string | null ): string {
	if ( ! dateString ) {
		return '-';
	}
	const date = new Date( dateString );
	const iso = date.toISOString().split( 'T' )[ 0 ];
	return iso || '-';
}

/**
 * Formats a number as USD with two decimal places for consistent column alignment.
 * Coerces strings and handles null/undefined/NaN so API values are safe.
 */
function formatCurrency( amount: number | string | null | undefined ): string {
	const n = typeof amount === 'number' ? amount : Number( amount );
	return Number.isFinite( n ) ? n.toFixed( 2 ) : '-';
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
	const product = products.find( ( p ) =>
		[ p.product_id, p.monthly_product_id, p.yearly_product_id ].includes( productId )
	);
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
	products: APIProductFamilyProduct[],
	isSingleClient?: boolean
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
							price,
							commissionPercentage: formatPercentage(
								getProductCommissionPercentage( match.product.slug, match.product.family_slug )
							),
							commissionAmount,
						} );
					} else if ( apiClient.client_user_id === 'N/A' && ! isSingleClient ) {
						const priceNum = typeof price === 'number' ? price : Number( price );
						const commissionNum =
							typeof commissionAmount === 'number' ? commissionAmount : Number( commissionAmount );
						const derivedPercentage =
							Number.isFinite( priceNum ) && priceNum > 0 && Number.isFinite( commissionNum )
								? commissionNum / priceNum
								: null;
						rows.push( {
							clientEmail,
							productName,
							quantity: 1,
							invoicedDate,
							price,
							commissionPercentage:
								derivedPercentage != null ? formatPercentage( derivedPercentage ) : '-',
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
		'Invoiced On',
		'Price (USD)',
		'Commission %',
		'Commission Amount (USD)',
	];

	const rows = referralCommissionPayout?.client_data?.length
		? buildRowsFromApi( referralCommissionPayout, referrals, products, isSingleClient )
		: [];

	const csvLines: string[] = [];
	csvLines.push( headers.map( csvEscape ).join( ',' ) );

	for ( const row of rows ) {
		const line = [
			...( isSingleClient ? [] : [ row.clientEmail ] ),
			row.productName,
			row.quantity,
			row.invoicedDate,
			formatCurrency( row.price ),
			row.commissionPercentage,
			formatCurrency( row.commissionAmount ),
		]
			.map( csvEscape )
			.join( ',' );
		csvLines.push( line );
	}

	return UTF8_BOM + csvLines.join( CSV_LINE_ENDING );
}
