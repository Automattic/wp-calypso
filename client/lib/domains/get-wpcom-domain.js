/**
 * Internal dependencies
 */
import { type as domainTypes } from './constants';

export function getWpcomDomain( domainObjects ) {
	const wpcomDomainObjects = domainObjects.filter( isWpcomDomain );

	if ( wpcomDomainObjects.length === 0 ) {
		return null;
	}

	// If there are .wpcomstaging and .wordpress domains, give preference to the .wpcomstaging one
	const wpcomStagingDomainObject = wpcomDomainObjects.filter( isWpcomStagingDomain );
	if ( wpcomStagingDomainObject.length > 0 ) {
		return wpcomStagingDomainObject[ 0 ];
	}

	return wpcomDomainObjects[ 0 ];
}

function isWpcomDomain( domainObject ) {
	return domainObject.type === domainTypes.WPCOM;
}

function isWpcomStagingDomain( { domain = '' } ) {
	return domain.endsWith( '.wpcomstaging.com' );
}
