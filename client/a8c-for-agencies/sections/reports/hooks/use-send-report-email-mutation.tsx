import { useMutation, UseMutationOptions, UseMutationResult } from '@tanstack/react-query';
import wpcom from 'calypso/lib/wp';
import { useSelector } from 'calypso/state';
import { getActiveAgencyId } from 'calypso/state/a8c-for-agencies/agency/selectors';
import type { APIError, SendReportEmailResponse } from '../types';

export interface SendReportEmailParams {
	reportId: number;
	preview?: boolean;
}

function sendReportEmailMutation(
	params: SendReportEmailParams,
	agencyId?: number
): Promise< SendReportEmailResponse > {
	if ( ! agencyId ) {
		throw new Error( 'Agency ID is required to send a report' );
	}

	if ( ! params.reportId ) {
		throw new Error( 'Report ID is required to send a report' );
	}

	const body = params.preview ? { preview: true } : {};

	return wpcom.req.post( {
		apiNamespace: 'wpcom/v2',
		path: `/agency/${ agencyId }/reports/${ params.reportId }/send`,
		body,
	} );
}

export default function useSendReportEmailMutation< TContext = unknown >(
	options?: UseMutationOptions< SendReportEmailResponse, APIError, SendReportEmailParams, TContext >
): UseMutationResult< SendReportEmailResponse, APIError, SendReportEmailParams, TContext > {
	const agencyId = useSelector( getActiveAgencyId );

	return useMutation< SendReportEmailResponse, APIError, SendReportEmailParams, TContext >( {
		...options,
		mutationFn: ( params ) => sendReportEmailMutation( params, agencyId ),
	} );
}
