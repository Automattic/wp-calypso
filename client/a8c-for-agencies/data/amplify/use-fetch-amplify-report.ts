import { useQuery } from '@tanstack/react-query';
import wpcom from 'calypso/lib/wp';
import { useSelector } from 'calypso/state';
import { getActiveAgencyId } from 'calypso/state/a8c-for-agencies/agency/selectors';
import type { AmplifyReport } from './types';

export const getAmplifyReportQueryKey = ( agencyId?: number, reportId?: string ) => [
	'a4a-amplify-report',
	agencyId,
	reportId,
];

function fetchAmplifyReport( agencyId: number, reportId: string ): Promise< AmplifyReport > {
	return wpcom.req.get( {
		apiNamespace: 'wpcom/v2',
		path: `/agency/${ agencyId }/amplify/reports/${ reportId }`,
	} );
}

export default function useFetchAmplifyReport( reportId?: string ) {
	const agencyId = useSelector( getActiveAgencyId );

	return useQuery< AmplifyReport >( {
		queryKey: getAmplifyReportQueryKey( agencyId, reportId ),
		queryFn: () => fetchAmplifyReport( agencyId as number, reportId as string ),
		enabled: !! agencyId && !! reportId,
		refetchOnWindowFocus: false,
	} );
}
