import { BusinessPlans, EcommercePlans } from '@automattic/api-core';

export function hasApmAccess( productSlug: string | undefined ): boolean {
	if ( ! productSlug ) {
		return false;
	}
	return (
		( BusinessPlans as readonly string[] ).includes( productSlug ) ||
		( EcommercePlans as readonly string[] ).includes( productSlug )
	);
}
