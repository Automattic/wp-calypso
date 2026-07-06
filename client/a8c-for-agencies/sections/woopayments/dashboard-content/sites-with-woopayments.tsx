import { useCallback } from 'react';
import CommissionsTable from 'calypso/dashboard/agency/earn/woopayments/commissions-table';
import { useDispatch } from 'calypso/state';
import { recordTracksEvent } from 'calypso/state/analytics/actions';
import { useWooPaymentsContext } from '../context';
import { useDownloadCommissionsReport } from '../hooks/use-download-commissions-report';

export default function SitesWithWooPayments() {
	const dispatch = useDispatch();
	const { sitesWithPluginsStates, woopaymentsData, isLoadingWooPaymentsData } =
		useWooPaymentsContext();
	const { downloadCommissionsReport } = useDownloadCommissionsReport();

	const recordTracks = useCallback(
		( eventName: string, properties?: Record< string, unknown > ) => {
			dispatch( recordTracksEvent( eventName, properties ) );
		},
		[ dispatch ]
	);

	return (
		<div className="redesigned-a8c-table full-width">
			<CommissionsTable
				sites={ sitesWithPluginsStates }
				woopaymentsData={ woopaymentsData }
				isLoadingWooPaymentsData={ isLoadingWooPaymentsData }
				recordTracksEvent={ recordTracks }
				onDownloadReport={ downloadCommissionsReport }
			/>
		</div>
	);
}
