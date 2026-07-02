import { useState } from 'react';
import { DataViews } from '../../../components/dataviews';
import { TextSkeleton } from '../../../components/text-skeleton';
import WooPaymentsConsolidatedStats from './consolidated-stats';
import { getWooPaymentsActions } from './dataviews/actions';
import { getWooPaymentsFields } from './dataviews/fields';
import WooPaymentsEmptyState from './empty-state';
import type { RecordTracksEvent } from './types';
import type { useWooPaymentsDashboardData } from './use-woopayments-dashboard-data';
import type { AgencyWooPaymentsSiteState } from '@automattic/api-core';
import type { View } from '@wordpress/dataviews';

const DEFAULT_VIEW: View = {
	type: 'table',
	page: 1,
	perPage: 100,
	fields: [
		'site',
		'transactions',
		'commissionsPaid',
		'timeframeCommissions',
		'woopaymentsStatus',
		'commissionEligibility',
	],
};

export interface WooPaymentsDashboardContentProps {
	data: ReturnType< typeof useWooPaymentsDashboardData >;
	agencyId: number;
	recordTracksEvent?: RecordTracksEvent;
	onAddWooPayments?: () => void;
}

export default function WooPaymentsDashboardContent( {
	data,
	agencyId,
	recordTracksEvent = () => {},
	onAddWooPayments,
}: WooPaymentsDashboardContentProps ) {
	const [ view, setView ] = useState< View >( DEFAULT_VIEW );

	if ( ! data.hasSites && ! data.isLoading ) {
		return (
			<WooPaymentsEmptyState
				onAddWooPayments={ onAddWooPayments }
				recordTracksEvent={ recordTracksEvent }
			/>
		);
	}

	if ( data.isLoading ) {
		return <TextSkeleton length={ 40 } />;
	}

	return (
		<>
			<WooPaymentsConsolidatedStats
				commissions={ data.commissions }
				isLoading={ data.isLoadingCommissions }
				recordTracksEvent={ recordTracksEvent }
			/>
			<DataViews< AgencyWooPaymentsSiteState >
				data={ data.sites }
				fields={ getWooPaymentsFields( { commissions: data.commissions, recordTracksEvent } ) }
				actions={ getWooPaymentsActions( { agencyId, recordTracksEvent } ) }
				getItemId={ ( item ) => String( item.blogId ) }
				isLoading={ data.isLoading }
				view={ view }
				onChangeView={ setView }
				search={ false }
				defaultLayouts={ { table: {} } }
				paginationInfo={ { totalItems: data.sites.length, totalPages: 1 } }
			/>
		</>
	);
}
