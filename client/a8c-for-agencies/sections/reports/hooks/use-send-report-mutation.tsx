import { useMutation, UseMutationOptions, UseMutationResult } from '@tanstack/react-query';
import wpcom from 'calypso/lib/wp';
import { useSelector } from 'calypso/state';
import { getActiveAgencyId } from 'calypso/state/a8c-for-agencies/agency/selectors';
import type { BuildReportFormData, ReportFormData } from '../types';

export interface APIError {
	status: number;
	code: string;
	message: string;
}

export interface SendReportResponse {
	id: string;
	status: 'sent' | 'error' | 'pending';
	message: string;
}

const parseEmailList = ( emailString: string ): string[] => {
	return emailString
		.split( ',' )
		.map( ( email ) => email.trim() )
		.filter( ( email ) => email.length > 0 );
};

const convertFormDataToApiFormat = ( formData: BuildReportFormData ): ReportFormData => {
	return {
		managed_site_id: formData.selectedSite?.managedSiteId || 0,
		timeframe: formData.selectedTimeframe,
		...( formData.selectedTimeframe === 'custom' && {
			start_date: formData.startDate,
			end_date: formData.endDate,
		} ),
		client_emails: parseEmailList( formData.clientEmail ),
		send_copy_to_team: formData.sendCopyToTeam,
		teammate_emails: parseEmailList( formData.teammateEmails ),
		custom_intro_text: formData.customIntroText,
		stats_items: formData.statsCheckedItems,
	};
};

function sendReportMutation(
	formData: BuildReportFormData,
	agencyId?: number
): Promise< SendReportResponse > {
	if ( ! agencyId ) {
		throw new Error( 'Agency ID is required to send a report' );
	}

	const apiData = convertFormDataToApiFormat( formData );

	return wpcom.req.post( {
		apiNamespace: 'wpcom/v2',
		path: `/agency/${ agencyId }/reports`,
		body: apiData,
	} );
}

export default function useSendReportMutation< TContext = unknown >(
	options?: UseMutationOptions< SendReportResponse, APIError, BuildReportFormData, TContext >
): UseMutationResult< SendReportResponse, APIError, BuildReportFormData, TContext > {
	const agencyId = useSelector( getActiveAgencyId );

	return useMutation< SendReportResponse, APIError, BuildReportFormData, TContext >( {
		...options,
		mutationFn: ( formData ) => sendReportMutation( formData, agencyId ),
	} );
}
