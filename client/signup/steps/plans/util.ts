import { getUrlParts } from '@automattic/calypso-url';

type DomainItem = {
	is_domain_registration?: boolean;
	meta?: string;
	product_slug?: string;
};

export const getIntervalType = ( path?: string ): string => {
	const url = path ?? window?.location?.href ?? '';
	const intervalType = getUrlParts( url ).searchParams.get( 'intervalType' ) || 'yearly';
	return [ 'yearly', '2yearly', 'monthly' ].includes( intervalType ) ? intervalType : 'yearly';
};

export const getDomainName = ( domainItem: DomainItem ): string | undefined => {
	return domainItem && domainItem.meta;
};
