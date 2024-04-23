import { useQuery } from '@tanstack/react-query';
import wpcom from 'calypso/lib/wp';
import { useSelector } from 'calypso/state';
import { getActiveAgencyId } from 'calypso/state/a8c-for-agencies/agency/selectors';

export const getGetTipaltiIFrameURLQueryKey = ( agencyId?: number ) => {
	return [ 'a4a-tipalti-iframe-url', agencyId ];
};

const showDummyData = false;

export default function useGetTipaltiIFrameURL() {
	const agencyId = useSelector( getActiveAgencyId );

	return useQuery( {
		queryKey: getGetTipaltiIFrameURLQueryKey( agencyId ),
		queryFn: () =>
			showDummyData
				? 'https://example.com/iframe-url'
				: wpcom.req.get(
						{
							apiNamespace: 'wpcom/v2',
							path: '/agency/embeds/tipalti',
						},
						{
							...( agencyId && { agency_id: agencyId } ),
						}
				  ),
		enabled: !! agencyId,
		refetchOnWindowFocus: false,
	} );
}
