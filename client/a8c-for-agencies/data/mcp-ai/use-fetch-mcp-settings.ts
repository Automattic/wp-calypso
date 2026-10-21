import { useQuery } from '@tanstack/react-query';
import wpcom from 'calypso/lib/wp';
import { useSelector } from 'calypso/state';
import { getActiveAgencyId } from 'calypso/state/a8c-for-agencies/agency/selectors';
import type { McpSettings } from './types';

export const getMcpSettingsQueryKey = ( agencyId?: number ) => [ 'a4a-mcp-settings', agencyId ];

function fetchMcpSettings( agencyId: number ): Promise< McpSettings > {
	return wpcom.req.get( {
		apiNamespace: 'wpcom/v2',
		path: `/agency/${ agencyId }/a4a-mcp/settings`,
	} );
}

export default function useFetchMcpSettings() {
	const agencyId = useSelector( getActiveAgencyId );

	return useQuery< McpSettings >( {
		queryKey: getMcpSettingsQueryKey( agencyId ),
		queryFn: () => fetchMcpSettings( agencyId as number ),
		enabled: !! agencyId,
		refetchOnWindowFocus: false,
	} );
}
