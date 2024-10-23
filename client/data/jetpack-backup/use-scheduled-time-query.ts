import { useQuery, UseQueryResult } from '@tanstack/react-query';
import wpcom from 'calypso/lib/wp';

export interface ScheduledTimeApi {
	ok: boolean;
	scheduled_hour: number;
	scheduled_by: string | null;
}

export interface ScheduledTime {
	scheduledHour: number;
	scheduledBy: string | null;
}

const useScheduledTimeQuery = ( blogId: number ): UseQueryResult< ScheduledTime, Error > => {
	const queryKey = [ 'jetpack-backup-scheduled-time', blogId ];

	return useQuery< ScheduledTimeApi, Error, ScheduledTime >( {
		queryKey,
		queryFn: async () =>
			wpcom.req.get( {
				path: `/sites/${ blogId }/rewind/scheduled`,
				apiNamespace: 'wpcom/v2',
			} ),
		refetchIntervalInBackground: false,
		refetchOnWindowFocus: false,
		select: ( data ) => ( {
			scheduledHour: data.scheduled_hour,
			scheduledBy: data.scheduled_by,
		} ),
	} );
};

export default useScheduledTimeQuery;
