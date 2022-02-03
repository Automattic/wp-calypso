import { type as domainTypes } from './constants';

export function getRegisteredDomains( domains ) {
	return domains.filter( isRegisteredDomain );
}

export function isRegisteredDomain( domain ) {
	return domain.type === domainTypes.REGISTERED;
}

export function isFreeUrlDomain( domain ) {
	return domain.type === domainTypes.WPCOM;
}
