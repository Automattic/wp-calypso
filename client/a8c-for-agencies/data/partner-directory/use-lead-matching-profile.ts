import { UseQueryResult, useQuery } from '@tanstack/react-query';
import { AgencyLeadMatchingResponse } from 'calypso/a8c-for-agencies/sections/partner-directory/types';
import wpcom from 'calypso/lib/wp';
import { useSelector } from 'calypso/state';
import { getActiveAgencyId } from 'calypso/state/a8c-for-agencies/agency/selectors';

export const getLeadMatchingProfileQueryKey = ( agencyId?: number ) => {
	return [ 'a4a-partner-directory-lead-matching', agencyId ];
};

export default function useLeadMatchingProfile(
	enabled = true
): UseQueryResult< AgencyLeadMatchingResponse, unknown > {
	const agencyId = useSelector( getActiveAgencyId );

	return useQuery( {
		queryKey: getLeadMatchingProfileQueryKey( agencyId ),
		queryFn: () =>
			wpcom.req.get( {
				apiNamespace: 'wpcom/v2',
				path: `/agency/${ agencyId }/lead-matching`,
			} ),
		enabled: enabled && !! agencyId,
		refetchOnWindowFocus: false,
	} );
}
