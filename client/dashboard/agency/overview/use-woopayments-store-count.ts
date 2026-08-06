import {
	agencySitesWithPluginsQuery,
	wooPaymentsLicensesQuery,
	WOOPAYMENTS_PLUGIN,
} from '@automattic/api-queries';
import { useQuery } from '@tanstack/react-query';

/**
 * Counts the agency's WooPayments stores: attached WooPayments licenses plus
 * sites running the plugin, de-duplicated by blog — matching the site list the
 * WooPayments dashboard renders.
 */
export default function useWooPaymentsStoreCount( agencyId: number, enabled = true ) {
	const isEnabled = !! agencyId && enabled;

	const { data: licenseBlogIds, isLoading: isLoadingLicenses } = useQuery( {
		...wooPaymentsLicensesQuery( agencyId ),
		enabled: isEnabled,
		refetchOnWindowFocus: false,
		// A license can be attached without a blog; folding nulls into a
		// placeholder id would count a phantom store.
		select: ( licenses ) =>
			licenses.flatMap( ( license ) => ( license.blog_id ? [ license.blog_id ] : [] ) ),
	} );

	const { data: pluginBlogIds, isLoading: isLoadingSites } = useQuery( {
		...agencySitesWithPluginsQuery( agencyId, [ WOOPAYMENTS_PLUGIN ] ),
		enabled: isEnabled,
		refetchOnWindowFocus: false,
		select: ( sites ) => sites.map( ( site ) => site.blog_id ),
	} );

	const blogIds = new Set( [ ...( licenseBlogIds ?? [] ), ...( pluginBlogIds ?? [] ) ] );

	return {
		storeCount: blogIds.size,
		isLoading: isLoadingLicenses || isLoadingSites,
	};
}
