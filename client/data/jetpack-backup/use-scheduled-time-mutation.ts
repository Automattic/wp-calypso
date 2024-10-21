import { useMutation, UseMutationResult, UseMutationOptions } from '@tanstack/react-query';
import wpcom from 'calypso/lib/wp';
import { useSelector } from 'calypso/state';
import { getSelectedSiteId } from 'calypso/state/ui/selectors';

export interface UpdateSchedulePayload {
	scheduledHour: number; // The new scheduled hour (0-23)
}

export interface UpdateScheduleResponse {
	ok: boolean;
	error: string;
}

export default function useScheduledTimeMutation<
	TData = UpdateScheduleResponse,
	TError = Error,
	TContext = unknown,
>(
	options: UseMutationOptions< TData, TError, UpdateSchedulePayload, TContext > = {}
): UseMutationResult< TData, TError, UpdateSchedulePayload, TContext > {
	const siteId = useSelector( getSelectedSiteId ) as number;

	return useMutation< TData, TError, UpdateSchedulePayload, TContext >( {
		...options,
		mutationFn: ( { scheduledHour }: UpdateSchedulePayload ): Promise< TData > => {
			return wpcom.req.post( {
				path: `/sites/${ siteId }/rewind/scheduled`,
				apiNamespace: 'wpcom/v2',
				body: { schedule_hour: scheduledHour },
			} );
		},
	} );
}
