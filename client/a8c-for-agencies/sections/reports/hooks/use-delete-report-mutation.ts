import { useMutation, UseMutationOptions, UseMutationResult } from '@tanstack/react-query';
import wpcom from 'calypso/lib/wp';
import { useSelector } from 'calypso/state';
import { getActiveAgencyId } from 'calypso/state/a8c-for-agencies/agency/selectors';

export interface DeleteReportResponse {
	success: boolean;
	message: string;
}

export interface DeleteReportVariables {
	id: number;
}

export interface APIError {
	status: number;
	code: string;
	message: string;
}

function deleteReportMutation(
	{ id }: DeleteReportVariables,
	agencyId?: number
): Promise< DeleteReportResponse > {
	if ( ! agencyId ) {
		throw new Error( 'Agency ID is required to delete a report' );
	}

	return wpcom.req.post( {
		method: 'DELETE',
		apiNamespace: 'wpcom/v2',
		path: `/agency/${ agencyId }/reports/${ id }`,
	} );
}

export default function useDeleteReportMutation< TContext = unknown >(
	options?: UseMutationOptions< DeleteReportResponse, APIError, DeleteReportVariables, TContext >
): UseMutationResult< DeleteReportResponse, APIError, DeleteReportVariables, TContext > {
	const agencyId = useSelector( getActiveAgencyId );

	return useMutation< DeleteReportResponse, APIError, DeleteReportVariables, TContext >( {
		...options,
		mutationFn: ( variables ) => deleteReportMutation( variables, agencyId ),
	} );
}
