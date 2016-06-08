/**
 * External dependencies
 */
var i18n = require( 'i18n-calypso' ),
	some = require( 'lodash/some' ),
	values = require( 'lodash/values' ),
	isDate = require( 'lodash/isDate' ),
	omit = require( 'lodash/omit' ),
	flatten = require( 'lodash/flatten' );

function formatDate( date ) {
	return i18n.moment( date ).format( 'MMM D, YYYY' );
}

function getSearchableStrings( transaction ) {
	var rootStrings = values( omit( transaction, 'items' ) ),
		itemStrings = flatten( transaction.items.map( values ) );

	return rootStrings.concat( itemStrings );
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
				var date = i18n.moment( transaction.date );

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
