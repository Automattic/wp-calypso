import { getProductCommissionPercentage } from './commissions';
import type {
	AgencyProduct,
	Referral,
	ReferralCommissionPayout,
	ReferralCommissionPayoutClient,
	ReferralPurchase,
} from '@automattic/api-core';

/** CSV line ending per RFC 4180; CRLF ensures Excel and Windows tools parse rows correctly. */
const CSV_LINE_ENDING = '\r\n';

/** UTF-8 BOM so Excel opens the file with correct encoding. */
const UTF8_BOM = '\uFEFF';

/**
 * Characters that spreadsheet applications (Excel, Google Sheets, etc.) treat as the
 * start of a formula. A field beginning with one of these can execute on open, so we
 * neutralize it. Includes tab and carriage return, which some parsers strip before
 * evaluating the remaining formula.
 */
const FORMULA_TRIGGERS = [ '=', '+', '-', '@', '\t', '\r' ];

/** Neutralizes formula injection by prefixing fields that begin with a trigger character. */
function csvEscape( value: unknown ): string {
	let str = value == null ? '' : String( value );
	// A lone trigger character (e.g. the '-' placeholder used for missing values) is not a
	// formula, so only neutralize when there is content after the trigger.
	if ( str.length > 1 && FORMULA_TRIGGERS.some( ( char ) => str.startsWith( char ) ) ) {
		str = `'${ str }`;
	}
	const needsQuotes = /[",\n]/.test( str );
	const escaped = str.replace( /"/g, '""' );
	return needsQuotes ? `"${ escaped }"` : escaped;
}

function formatDate( dateString: string | null ): string {
	if ( ! dateString ) {
		return '-';
	}
	const date = new Date( dateString );
	const iso = date.toISOString().split( 'T' )[ 0 ];
	return iso || '-';
}

function formatCurrency( amount: number | string | null | undefined ): string {
	const n = typeof amount === 'number' ? amount : Number( amount );
	return Number.isFinite( n ) ? n.toFixed( 2 ) : '-';
}

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

function findMatchingPurchase(
	referrals: Referral[],
	apiClient: ReferralCommissionPayoutClient,
	productId: number,
	products: AgencyProduct[]
): { referral: Referral; purchase: ReferralPurchase; product: AgencyProduct } | null {
	const referral = referrals.find(
		( r ) =>
			r.client.id === apiClient.client_user_id ||
			r.client.email?.toLowerCase() === apiClient.email?.toLowerCase()
	);
	if ( ! referral?.purchases?.length ) {
		return null;
	}
	const product = products.find( ( p ) =>
		[
			p.product_id,
			p.monthly_product_id,
			p.yearly_product_id,
			p.alternative_product_id,
			p.monthly_alternative_product_id,
			p.yearly_alternative_product_id,
		].includes( productId )
	);
	if ( ! product ) {
		return null;
	}
	const purchase = referral.purchases.find( ( p ) =>
		[
			product.product_id,
			product.monthly_product_id,
			product.yearly_product_id,
			product.alternative_product_id,
			product.monthly_alternative_product_id,
			product.yearly_alternative_product_id,
		].includes( p.product_id )
	);
	if ( ! purchase || purchase.status === 'pending' || purchase.status === 'error' ) {
		return null;
	}
	return { referral, purchase, product };
}

function buildRowsFromApi(
	referralCommissionPayout: ReferralCommissionPayout,
	referrals: Referral[],
	products: AgencyProduct[],
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

export function generateCommissionsCsv(
	referrals: Referral[],
	products: AgencyProduct[],
	referralCommissionPayout?: ReferralCommissionPayout,
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
