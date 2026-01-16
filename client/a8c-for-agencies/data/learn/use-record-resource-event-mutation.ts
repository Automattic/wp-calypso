import { useMutation, UseMutationOptions, UseMutationResult } from '@tanstack/react-query';
import wpcom from 'calypso/lib/wp';

interface RecordResourceEventParams {
	resourceId: number;
	resourceName: string;
	agencyId: number;
}

interface APIResponse {
	success: boolean;
}

interface APIError {
	message: string;
	code?: string;
}

function mutationRecordResourceEvent( params: RecordResourceEventParams ): Promise< APIResponse > {
	return wpcom.req.post( {
		apiNamespace: 'wpcom/v2',
		path: '/agency/resources/record-event',
		body: {
			resource_id: params.resourceId,
			resource_name: params.resourceName,
			agency_id: params.agencyId,
		},
	} );
}

export default function useRecordResourceEventMutation< TContext = unknown >(
	options?: UseMutationOptions< APIResponse, APIError, RecordResourceEventParams, TContext >
): UseMutationResult< APIResponse, APIError, RecordResourceEventParams, TContext > {
	return useMutation< APIResponse, APIError, RecordResourceEventParams, TContext >( {
		...options,
		mutationFn: mutationRecordResourceEvent,
	} );
}
