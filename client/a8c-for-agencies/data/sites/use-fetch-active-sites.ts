import { useQuery } from '@tanstack/react-query';
import wpcom from 'calypso/lib/wp';
import { useSelector } from 'calypso/state';
import { getActiveAgencyId } from 'calypso/state/a8c-for-agencies/agency/selectors';

type Props = {
	autoRefresh: boolean;
};

const REFRESH_INTERVAL = 1000;

export default function useFetchActiveSites( { autoRefresh }: Props ) {
	const agencyId = useSelector( getActiveAgencyId );

	return useQuery( {
		queryKey: [ 'a4a-sites', agencyId ],
		queryFn: () =>
			wpcom.req.get( {
				apiNamespace: 'wpcom/v2',
				path: `/agency/${ agencyId }/sites`,
			} ),
		select: ( data ) => {
			return data;
		},
		enabled: !! agencyId,
		refetchOnWindowFocus: false,
		refetchInterval: autoRefresh ? REFRESH_INTERVAL : false,
	} );
}
