import {
	agencySitesWithPluginsQuery,
	wooPaymentsLicensesQuery,
	WOOPAYMENTS_PLUGIN,
} from '@automattic/api-queries';
import { useQuery } from '@tanstack/react-query';

/**
 * Counts the agency's WooPayments stores the way the WooPayments dashboard does:
 * attached WooPayments licenses plus sites running the plugin, de-duplicated by blog.
 */
export default function useWooPaymentsStoreCount( agencyId: number, enabled = true ) {
	const isEnabled = !! agencyId && enabled;

	const { data: licenseBlogIds, isLoading: isLoadingLicenses } = useQuery( {
		...wooPaymentsLicensesQuery( agencyId ),
		enabled: isEnabled,
		select: ( licenses ) => licenses.map( ( license ) => license.blog_id ?? 0 ),
	} );

	const { data: pluginBlogIds, isLoading: isLoadingSites } = useQuery( {
		...agencySitesWithPluginsQuery( agencyId, [ WOOPAYMENTS_PLUGIN ] ),
		enabled: isEnabled,
		select: ( sites ) => sites.map( ( site ) => site.blog_id ),
	} );

	const blogIds = new Set( [ ...( licenseBlogIds ?? [] ), ...( pluginBlogIds ?? [] ) ] );

	return {
		storeCount: blogIds.size,
		isLoading: isLoadingLicenses || isLoadingSites,
	};
}
