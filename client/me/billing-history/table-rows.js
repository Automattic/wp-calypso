/**
 * External dependencies
 */
import { moment } from 'i18n-calypso';
import {
	flatten,
	isDate,
	omit,
	some,
	values,
	without,
} from 'lodash';

function formatDate( date ) {
	return moment( date ).format( 'MMM D, YYYY' );
}

function getSearchableStrings( transaction ) {
	const rootStrings = values( omit( transaction, 'items' ) ),
		transactionItems = transaction.items || [],
		itemStrings = flatten( transactionItems.map( values ) );

	return without( rootStrings.concat( itemStrings ), null, undefined );
}

function search( transactions, searchQuery ) {
	return transactions.filter( function( transaction ) {
		return some( getSearchableStrings( transaction ), function( val ) {
			var haystack, needle;

			if ( isDate( val ) ) {
				val = formatDate( val );
			}

			haystack = val.toString().toLowerCase();
			needle = searchQuery.toLowerCase();

			return haystack.indexOf( needle ) !== -1;
		} );
	} );
}

function filter( transactions, params ) {
	if ( params.search ) {
		transactions = search( transactions, params.search );
	}

	if ( params.date ) {
		if ( params.date.newest ) {
			transactions = transactions.slice( 0, params.date.newest );
		} else if ( params.date.month || params.date.before ) {
			transactions = transactions.filter( function( transaction ) {
				const date = moment( transaction.date );

				if ( params.date.month ) {
					return date.isSame( params.date.month, 'month' );
				} else if ( params.date.before ) {
					return date.isBefore( params.date.before, 'month' );
				}
			} );
		}
	}

	if ( params.app && params.app !== 'all' ) {
		transactions = transactions.filter( function( transaction ) {
			return transaction.service === params.app;
		} );
	}

	return transactions;
}

module.exports = {
	formatDate: formatDate,
	filter: filter
};
