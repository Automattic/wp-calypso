import { useLocale } from '@automattic/i18n-utils';
import { useCallback } from 'react';
import useProductsQuery from 'calypso/a8c-for-agencies/data/marketplace/use-products-query';
import DashboardConsolidatedViews from 'calypso/dashboard/agency/earn/referrals/consolidated-views';
import { useDispatch } from 'calypso/state';
import { recordTracksEvent } from 'calypso/state/analytics/actions';
import type { Referral, ReferralCommissionPayoutResponse } from '../types';

type ConsolidatedViewsProps = {
	referrals: Referral[];
	referralCommissionPayout?: ReferralCommissionPayoutResponse | undefined;
	isSingleClient?: boolean;
	isLoading?: boolean;
};

export default function ConsolidatedViews( {
	referrals,
	referralCommissionPayout,
	isSingleClient,
	isLoading,
}: ConsolidatedViewsProps ) {
	const dispatch = useDispatch();
	const locale = useLocale();
	const { data: productsData } = useProductsQuery( false, true );

	const handleRecordTracksEvent = useCallback(
		( eventName: string, properties?: Record< string, unknown > ) => {
			dispatch( recordTracksEvent( eventName, properties ) );
		},
		[ dispatch ]
	);

	return (
		<DashboardConsolidatedViews
			referrals={ referrals }
			referralCommissionPayout={ referralCommissionPayout }
			isSingleClient={ isSingleClient }
			isLoading={ isLoading }
			locale={ locale }
			products={ productsData }
			recordTracksEvent={ handleRecordTracksEvent }
		/>
	);
}
