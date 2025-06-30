import { useQueryClient } from '@tanstack/react-query';
import { useTranslate } from 'i18n-calypso';
import { useCallback } from 'react';
import { useDispatch, useSelector } from 'calypso/state';
import { getActiveAgencyId } from 'calypso/state/a8c-for-agencies/agency/selectors';
import { errorNotice, successNotice } from 'calypso/state/notices/actions';
import { getReportsQueryKey } from '../lib/get-reports-query-key';
import useDeleteReportMutation from './use-delete-report-mutation';
import type { Report } from '../types';

export default function useHandleReportDelete() {
	const translate = useTranslate();
	const dispatch = useDispatch();
	const queryClient = useQueryClient();

	// Reports query key so we optimistically update the reports list
	const agencyId = useSelector( getActiveAgencyId );
	const reportsQueryKey = getReportsQueryKey( agencyId );

	const { mutate: deleteReport, isPending } = useDeleteReportMutation( {
		// Optimistically update the reports list
		onMutate: async ( { id }: { id: number } ) => {
			// Cancel any current refetches, so they don't overwrite our optimistic update
			await queryClient.cancelQueries( {
				queryKey: reportsQueryKey,
			} );
			// Snapshot the previous value
			const previousReports = queryClient.getQueryData( reportsQueryKey );
			// Optimistically remove the report from the list
			queryClient.setQueryData( reportsQueryKey, ( oldReports: Report[] | undefined ) => {
				if ( ! oldReports ) {
					return [];
				}
				return oldReports.filter( ( report: Report ) => report.id !== id );
			} );
			// Store previous reports in case of failure
			return { previousReports };
		},
		onError: ( error, variables, context ) => {
			// Rollback on error
			if ( context?.previousReports ) {
				queryClient.setQueryData( reportsQueryKey, context.previousReports );
			}
		},
		onSettled: () => {
			queryClient.invalidateQueries( {
				queryKey: reportsQueryKey,
			} );
		},
	} );

	const handleDeleteReport = useCallback(
		( report: Report, callback?: ( isSuccess: boolean ) => void ) => {
			deleteReport(
				{ id: report.id },
				{
					onSuccess: () => {
						dispatch(
							successNotice( translate( 'The report has been deleted.' ), {
								id: 'delete-report-success',
								duration: 5000,
							} )
						);
						callback?.( true );
					},

					onError: ( error ) => {
						dispatch(
							errorNotice(
								error.message || translate( 'Failed to delete report. Please try again.' ),
								{
									id: 'delete-report-error',
									duration: 5000,
								}
							)
						);
						callback?.( false );
					},
				}
			);
		},
		[ deleteReport, dispatch, translate ]
	);

	return {
		handleDeleteReport,
		isPending,
	};
}
