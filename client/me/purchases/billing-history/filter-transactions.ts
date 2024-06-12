import { getLocaleSlug } from 'i18n-calypso';
import moment from 'moment';
import {
	BillingTransaction,
	BillingTransactionUiState,
} from 'calypso/state/billing-transactions/types';

/**
 * Utility function for formatting date for text search
 */
function formatDate( date: string ): string {
	const localeSlug = getLocaleSlug();
	return moment( date )
		.locale( localeSlug ?? '' )
		.format( 'll' );
}

/**
 * Utility function extracting searchable strings from a single transaction
 */
function getSearchableStrings( transaction: BillingTransaction ): string[] {
	const rootStrings: string[] = Object.values( transaction ).filter(
		( value ) => typeof value === 'string'
	);
	const dateString: string | null = transaction.date ? formatDate( transaction.date ) : null;
	const itemStrings: string[] = transaction.items.flatMap( ( item ) => Object.values( item ) );

	return [ ...rootStrings, dateString, ...itemStrings ].filter(
		( item: string | null ): item is string => !! item
	);
}

/**
 * Utility function to search the transactions by the provided searchQuery
 */
function searchTransactions(
	transactions: BillingTransaction[],
	searchQuery: string
): BillingTransaction[] {
	const needle = searchQuery.toLowerCase();

	return transactions.filter( ( transaction: BillingTransaction ) =>
		getSearchableStrings( transaction ).some( ( val ) => {
			const haystack = val.toString().toLowerCase();
			return haystack.includes( needle );
		} )
	);
}

export function filterTransactions(
	transactions: BillingTransaction[] | null | undefined,
	filter: BillingTransactionUiState,
	siteId: number | string | null | undefined
): BillingTransaction[] {
	const { app, date, query } = filter;
	let results = query ? searchTransactions( transactions ?? [], query ) : transactions ?? [];

	if ( date && date.month && date.operator ) {
		results = results.filter( ( transaction ) => {
			const transactionDate = moment( transaction.date );

			if ( 'equal' === date.operator ) {
				return transactionDate.isSame( date.month, 'month' );
			} else if ( 'before' === date.operator ) {
				return transactionDate.isBefore( date.month, 'month' );
			}
		} );
	}

	if ( app && app !== 'all' ) {
		results = results.filter( ( transaction ) => transaction.service === app );
	}

	if ( siteId ) {
		results = results.filter( ( transaction ) => {
			return transaction.items.some( ( receiptItem ) => {
				return String( receiptItem.site_id ) === String( siteId );
			} );
		} );
	}

	return results;
}

export function paginateTransactions(
	transactions: BillingTransaction[],
	page: number | null | undefined,
	pageSize: number
): BillingTransaction[] {
	const pageIndex = ( page ?? 1 ) - 1;
	return transactions.slice( pageIndex * pageSize, pageIndex * pageSize + pageSize );
}
