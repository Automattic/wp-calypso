/**
 * @format
 */

/**
 * Internal dependencies
 */
import { domainAvailability } from 'lib/domains/constants';

export function isFreeOrUnknownSuggestion( suggestion ) {
	return suggestion.is_free === true || suggestion.status === domainAvailability.UNKNOWN;
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
