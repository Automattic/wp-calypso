import { useQuery } from '@tanstack/react-query';
import wpcom from 'calypso/lib/wp';
import type { McpSettings } from './types';

export const getMcpSettingsQueryKey = () => [ 'a4a-mcp-settings' ];

function fetchMcpSettings(): Promise< McpSettings > {
	return wpcom.req.get( {
		apiNamespace: 'wpcom/v2',
		path: '/a4a-mcp/settings',
	} );
}

export default function useFetchMcpSettings() {
	return useQuery< McpSettings >( {
		queryKey: getMcpSettingsQueryKey(),
		queryFn: fetchMcpSettings,
		refetchOnWindowFocus: false,
	} );
}
