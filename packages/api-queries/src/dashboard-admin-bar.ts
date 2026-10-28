import { fetchDashboardAdminBar } from '@automattic/api-core';
import { queryOptions } from '@tanstack/react-query';
import type { AdminBarResponse } from '@automattic/api-core';

/**
 * Whether the admin bar has the Agents Manager AI chat node, which WordPress.com
 * sends outside the editors only to proxied Automatticians.
 */
export const hasAiChatNode = ( adminBar: AdminBarResponse ) =>
	adminBar.nodes.some( ( node ) => node.id === 'agents-manager-ai-chat' );

export const dashboardAdminBarQuery = () =>
	queryOptions( {
		queryKey: [ 'dashboard-admin-bar' ],
		queryFn: fetchDashboardAdminBar,
		// So a later session, possibly unproxied, never restores it.
		meta: { persist: ( data: AdminBarResponse ) => ! hasAiChatNode( data ) },
	} );
