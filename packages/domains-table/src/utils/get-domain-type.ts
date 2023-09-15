import { DomainData } from '@automattic/data-stores';
import { type as domainTypes } from './constants';

export function getDomainType(
	domainFromApi: Pick< DomainData, 'type' | 'wpcom_domain' | 'has_registration' >
) {
	if ( domainFromApi.type === 'redirect' ) {
		return domainTypes.SITE_REDIRECT;
	}

	if ( domainFromApi.type === 'transfer' ) {
		return domainTypes.TRANSFER;
	}

	if ( domainFromApi.wpcom_domain ) {
		return domainTypes.WPCOM;
	}

	if ( domainFromApi.has_registration ) {
		return domainTypes.REGISTERED;
	}

	return domainTypes.MAPPED;
}
