import { domainManagementEdit, domainManagementList } from 'calypso/my-sites/domains/paths';

export function getDomainManagementUrl(
	{ slug }: { slug: string },
	domain: string | undefined
): string {
	return domain ? domainManagementEdit( slug, domain ) : domainManagementList( slug );
}
