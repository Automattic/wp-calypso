import { activeAgencyQuery, amplifyReportsQuery } from '@automattic/api-queries';
import { useQuery } from '@tanstack/react-query';
import { useState } from 'react';
import { canStartScan, getUsageStatus } from './usage';

export type AmplifyPageState = 'empty' | 'reports' | 'loading' | 'error';

/** The agency, its reports and its monthly usage, shared by both dashboards' Prospect reports page. */
export function useAmplifyPage() {
	const { data: agency } = useQuery( activeAgencyQuery() );
	const agencyId = agency?.id ?? 0;
	const reportsQuery = useQuery( amplifyReportsQuery( agencyId ) );
	const [ notActivated, setNotActivated ] = useState( false );
	const reports = reportsQuery.data?.reports ?? [];
	let state: AmplifyPageState = 'empty';
	if ( agency === undefined || reportsQuery.isLoading ) {
		state = 'loading';
	} else if ( reportsQuery.isError && ! reportsQuery.data ) {
		state = 'error';
	} else if ( reports.length > 0 ) {
		state = 'reports';
	}
	const usage = reportsQuery.data?.usage;
	const usageStatus = getUsageStatus( usage, {
		approvalStatus: agency?.approval_status,
		notActivated,
	} );

	return {
		agencyId,
		reports,
		state,
		usage,
		usageStatus,
		tierId: agency?.tier?.id,
		canScan: canStartScan( usageStatus ),
		refetch: () => reportsQuery.refetch(),
		handleUsageError: ( code: string ) => {
			if ( code === 'amplify_account_not_activated' ) {
				setNotActivated( true );
			}
			reportsQuery.refetch();
		},
	};
}

export type AmplifyPage = ReturnType< typeof useAmplifyPage >;
