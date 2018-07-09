/** @format */

/**
 * External dependencies
 */
import { find, startsWith } from 'lodash';

/**
 * Internal dependencies
 */
import { domainAvailability } from 'lib/domains/constants';

function moveArrayElement( array, from, to ) {
	if ( from !== to && from < array.length && to < array.length ) {
		array.splice( to, 0, array.splice( from, 1 )[ 0 ] );
	}
}

export function markFeaturedSuggestions(
	suggestions,
	exactMatchDomain,
	strippedDomainBase,
	featuredSuggestionsAtTop = false
) {
	function isExactMatchBeforeTld( suggestion ) {
		return (
			suggestion.domain_name === exactMatchDomain ||
			startsWith( suggestion.domain_name, `${ strippedDomainBase }.` )
		);
	}

	function isBestAlternative( suggestion ) {
		return ! isExactMatchBeforeTld( suggestion ) && suggestion.isRecommended !== true;
	}

	const output = [ ...suggestions ];

	const recommendedSuggestion = featuredSuggestionsAtTop
		? null
		: find( output, isExactMatchBeforeTld );

	if ( recommendedSuggestion ) {
		recommendedSuggestion.isRecommended = true;
		moveArrayElement( output, output.indexOf( recommendedSuggestion ), 0 );
	} else if ( output.length > 0 ) {
		output[ 0 ].isRecommended = true;
	}

	const bestAlternativeSuggestion = featuredSuggestionsAtTop
		? null
		: find( output, isBestAlternative );

	if ( bestAlternativeSuggestion ) {
		bestAlternativeSuggestion.isBestAlternative = true;
		moveArrayElement( output, output.indexOf( bestAlternativeSuggestion ), 1 );
	} else if ( output.length > 1 ) {
		output[ 1 ].isBestAlternative = true;
	}

	return output;
}

export function isUnknownSuggestion( suggestion ) {
	return suggestion.status === domainAvailability.UNKNOWN;
}

export function isFreeSuggestion( suggestion ) {
	return suggestion.is_free === true;
}

export function getStrippedDomainBase( domain ) {
	let strippedDomainBase = domain;
	const lastIndexOfDot = strippedDomainBase.lastIndexOf( '.' );

	if ( lastIndexOfDot !== -1 ) {
		strippedDomainBase = strippedDomainBase.substring( 0, lastIndexOfDot );
	}
	return strippedDomainBase.replace( /[ .]/g, '' );
}

export function isNumberString( string ) {
	return /^[0-9_]+$/.test( string );
}

export function getTldWeightOverrides( designType ) {
	return designType && designType === 'blog' ? 'design_type_blog' : null;
}
