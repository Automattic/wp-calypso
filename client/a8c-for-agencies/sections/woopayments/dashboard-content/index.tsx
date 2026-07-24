import { __experimentalVStack as VStack } from '@wordpress/components';
import { useCallback } from 'react';
import CommissionsTable from 'calypso/dashboard/agency/earn/woopayments/commissions-table';
import ConsolidatedViews from 'calypso/dashboard/agency/earn/woopayments/consolidated-views';
import { useDownloadCommissionsReport } from 'calypso/dashboard/agency/earn/woopayments/use-download-commissions-report';
import { useDispatch } from 'calypso/state';
import { recordTracksEvent } from 'calypso/state/analytics/actions';
import type { WooPaymentsData } from '@automattic/api-core';
import type { SitesWithWooPaymentsState } from 'calypso/dashboard/agency/earn/woopayments/types';

import './style.scss';

interface WooPaymentsDashboardContentProps {
	agencyId: number;
	woopaymentsData?: WooPaymentsData;
	isLoadingWooPaymentsData: boolean;
	sitesWithPluginsStates: SitesWithWooPaymentsState[];
}

const WooPaymentsDashboardContent = ( {
	agencyId,
	woopaymentsData,
	isLoadingWooPaymentsData,
	sitesWithPluginsStates,
}: WooPaymentsDashboardContentProps ) => {
	const dispatch = useDispatch();
	const { downloadCommissionsReport } = useDownloadCommissionsReport( agencyId );

	const recordTracks = useCallback(
		( eventName: string, properties?: Record< string, unknown > ) => {
			dispatch( recordTracksEvent( eventName, properties ) );
		},
		[ dispatch ]
	);

	return (
		<VStack spacing={ 6 }>
			<ConsolidatedViews
				woopaymentsData={ woopaymentsData }
				isLoading={ isLoadingWooPaymentsData }
			/>
			<div className="redesigned-a8c-table full-width">
				<CommissionsTable
					sites={ sitesWithPluginsStates }
					woopaymentsData={ woopaymentsData }
					isLoadingWooPaymentsData={ isLoadingWooPaymentsData }
					recordTracksEvent={ recordTracks }
					onDownloadReport={ downloadCommissionsReport }
				/>
			</div>
		</VStack>
	);
};

export default WooPaymentsDashboardContent;
