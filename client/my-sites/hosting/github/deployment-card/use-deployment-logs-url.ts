import { useQuery } from '@tanstack/react-query';
import { useMemo } from 'react';
import wp from 'calypso/lib/wp';
import { useSelector } from 'calypso/state';
import { getSelectedSiteId } from 'calypso/state/ui/selectors';
import { GITHUB_INTEGRATION_QUERY_KEY } from '../constants';

interface DeploymentLogsData {
	text: string;
}

interface UseDeploymentLogsURLArguments {
	connectionId: number;
	deploymentTimestamp: number;
}

export const useDeploymentLogsURL = ( {
	connectionId,
	deploymentTimestamp,
}: UseDeploymentLogsURLArguments ) => {
	const siteId = useSelector( getSelectedSiteId );

	const { data } = useQuery< DeploymentLogsData >( {
		queryKey: [
			GITHUB_INTEGRATION_QUERY_KEY,
			siteId,
			connectionId,
			'deployment-logs',
			deploymentTimestamp,
		],
		queryFn: () =>
			wp.req.get( {
				path: `/sites/${ siteId }/hosting/github/deployment-logs`,
				apiNamespace: 'wpcom/v2',
			} ),
		enabled: !! siteId,
	} );

	const logsBlobUrl = useMemo( () => {
		if ( ! data ) {
			return null;
		}

		return URL.createObjectURL( new Blob( [ data.text ], { type: 'text/plain' } ) );
	}, [ data ] );

	return logsBlobUrl;
};
