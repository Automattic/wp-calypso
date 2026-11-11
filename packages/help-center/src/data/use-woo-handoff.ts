import { useQuery } from '@tanstack/react-query';
import apiFetch from '@wordpress/api-fetch';
import type { WooHandoffData } from '../human-routing/woo-handoff';

export type WooHandoff = {
	/** Null when WooCommerce.com couldn't send it, which leaves the tier unknown. */
	merchant: WooHandoffData | null;
	/** WooCommerce.com turns this merchant away from support, as the support form does. */
	isSupportBlocked: boolean;
};

/**
 * The signed-in merchant's support details, from WooCommerce.com (WCCOM-3143). Any failure other
 * than a block leaves them out, so the request still reaches a person.
 */
export async function fetchWooHandoff(): Promise< WooHandoff > {
	try {
		const merchant = await apiFetch< WooHandoffData >( { path: '/wccom/help-center/v1/handoff' } );

		return { merchant, isSupportBlocked: false };
	} catch ( error ) {
		const status = ( error as { data?: { status?: number } } | null )?.data?.status;

		return { merchant: null, isSupportBlocked: status === 403 };
	}
}

/** Fetched when a merchant asks for a person, and again for each request, so it's never stale. */
export function useWooHandoff() {
	return useQuery( {
		queryKey: [ 'help-center-woo-handoff' ],
		queryFn: fetchWooHandoff,
		gcTime: 0,
		refetchOnWindowFocus: false,
	} );
}
