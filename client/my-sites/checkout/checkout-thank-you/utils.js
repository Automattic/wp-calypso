/**
 * Internal dependencies
 */

import { domainManagementEdit, domainManagementList } from 'calypso/my-sites/domains/paths';

export function getDomainManagementUrl( { slug }, domain ) {
	return domain ? domainManagementEdit( slug, domain ) : domainManagementList( slug );
}
