import { useCallback } from 'react';
import CommissionsTable from 'calypso/dashboard/agency/earn/woopayments/commissions-table';
import { useDownloadCommissionsReport } from 'calypso/dashboard/agency/earn/woopayments/use-download-commissions-report';
import { useDispatch, useSelector } from 'calypso/state';
import { getActiveAgencyId } from 'calypso/state/a8c-for-agencies/agency/selectors';
import { recordTracksEvent } from 'calypso/state/analytics/actions';
import { useWooPaymentsContext } from '../context';

export default function SitesWithWooPayments() {
	const dispatch = useDispatch();
	const agencyId = useSelector( getActiveAgencyId ) ?? 0;
	const { sitesWithPluginsStates, woopaymentsData, isLoadingWooPaymentsData } =
		useWooPaymentsContext();
	const { downloadCommissionsReport } = useDownloadCommissionsReport( agencyId );

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
