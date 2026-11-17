import {
	dashboardAdminBarQuery,
	omnibarSiteIdQuery,
	queryClient,
	siteAdminBarQuery,
} from '@automattic/api-queries';
import { useQuery } from '@tanstack/react-query';

/**
 * Whether the omnibar can still show its AI chat button, which needs its admin-bar
 * nodes (the site's, else the dashboard's). Reads those queries without fetching.
 */
export function useCanShowAiChatNode(): boolean {
	const { data: siteId } = useQuery( { ...omnibarSiteIdQuery(), enabled: false }, queryClient );
	const dashboardAdminBar = useQuery(
		{ ...dashboardAdminBarQuery(), enabled: false },
		queryClient
	);
	const siteAdminBar = useQuery(
		{ ...siteAdminBarQuery( siteId ?? 0 ), enabled: false },
		queryClient
	);

	const hasAdminBarNodes = !! dashboardAdminBar.data || !! siteAdminBar.data;
	const isLoadingAdminBarNodes =
		dashboardAdminBar.isPending || ( !! siteId && siteAdminBar.isPending );

	return hasAdminBarNodes || isLoadingAdminBarNodes;
}
