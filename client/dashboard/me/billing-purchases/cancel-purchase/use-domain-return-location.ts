import { OFFSITE_REDIRECT } from '@automattic/api-core';
import { useSearch } from '@tanstack/react-router';
import { useMemo } from 'react';
import { domainRoute } from '../../../app/router/domains';
import { cancelPurchaseRoute } from '../../../app/router/me';
import type { Purchase } from '@automattic/api-core';

/**
 * Where to go when leaving the cancel flow that was opened from the domain overview,
 * or `null` when it wasn't.
 */
export function useDomainReturnLocation( purchase?: Purchase ) {
	const { back_to: backTo, domain_back_to: domainBackTo } = useSearch( {
		from: cancelPurchaseRoute.fullPath,
	} );
	const domainName =
		backTo === 'domain' && ( purchase?.is_domain || purchase?.product_slug === OFFSITE_REDIRECT )
			? purchase.meta
			: undefined;

	return useMemo(
		() =>
			domainName
				? {
						to: domainRoute.fullPath,
						params: { domainName },
						search: domainBackTo ? { back_to: domainBackTo } : {},
					}
				: null,
		[ domainName, domainBackTo ]
	);
}
