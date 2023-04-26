import { getUrlParts } from '@automattic/calypso-url';

type DomainItem = {
	is_domain_registration?: boolean;
	meta?: string;
	product_slug?: string;
};

export const getIntervalType = ( path: string ): string => {
	const pathHasIntervalType = path.includes( 'intervalType=' );

	if ( pathHasIntervalType ) {
		const urlPartsFromPath = getUrlParts( path );
		return urlPartsFromPath.searchParams.get( 'intervalType' ) || 'yearly';
	}

	const urlParts = getUrlParts( typeof window !== 'undefined' ? window.location.href : '' );
	const intervalType = urlParts.searchParams.get( 'intervalType' ) || '';

	if ( [ 'yearly', '2yearly', 'monthly' ].includes( intervalType ) ) {
		return intervalType;
	}

	// Default value
	return 'yearly';
};

export const getDomainName = ( domainItem: DomainItem ): string | undefined => {
	return domainItem && domainItem.meta;
};
