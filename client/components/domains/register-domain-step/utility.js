/**
 * @format
 */

/**
 * Internal dependencies
 */
import { domainAvailability } from 'lib/domains/constants';

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
