import { formatCurrency } from '@automattic/number-formatters';
import { Button } from '@wordpress/components';
import { useTranslate } from 'i18n-calypso';
import { useCallback } from 'react';
import {
	ConsolidatedStatsCard,
	ConsolidatedStatsGroup,
} from 'calypso/a8c-for-agencies/components/consolidated-stats-card';
import { AGENCY_EARNINGS_LEARN_MORE_LINK } from 'calypso/a8c-for-agencies/constants';
import useProductsQuery from 'calypso/a8c-for-agencies/data/marketplace/use-products-query';
import useHelpCenter from 'calypso/a8c-for-agencies/hooks/use-help-center';
import { useDownloadCommissionsCsv } from '../hooks/use-download-commissions-csv';
import useGetConsolidatedPayoutData from '../hooks/use-get-consolidated-payout-data';
import PayoutCards from './payout-cards';
import type { Referral, ReferralCommissionPayoutResponse } from '../types';

type ConsolidatedViewsProps = {
	referrals: Referral[];
	referralCommissionPayout?: ReferralCommissionPayoutResponse | undefined;
	isSingleClient?: boolean;
	isLoading?: boolean;
};

function findClientTotalCommission(
	referral: Referral,
	referralCommissionPayout?: ReferralCommissionPayoutResponse
): number | undefined {
	if ( ! referralCommissionPayout?.client_data?.length ) {
		return undefined;
	}
	const client = referralCommissionPayout.client_data.find(
		( c ) =>
			c.client_user_id === referral.client.id ||
			c.email?.toLowerCase() === referral.client.email?.toLowerCase()
	);
	return client?.total_commission;
}

export default function ConsolidatedViews( {
	referrals,
	referralCommissionPayout,
	isSingleClient,
	isLoading,
}: ConsolidatedViewsProps ) {
	const translate = useTranslate();
	const { data: productsData, isFetching } = useProductsQuery( false, true );
	const { previousQuarterExpectedCommission, pendingOrders, currentQuarterExpectedCommission } =
		useGetConsolidatedPayoutData( referrals, productsData );
	const { showSupportGuide } = useHelpCenter();
	const { downloadCommissionsCsv } = useDownloadCommissionsCsv( isSingleClient );

	const clientEmail = isSingleClient ? referrals[ 0 ]?.client?.email : undefined;

	const handleDownloadCsv = useCallback( () => {
		downloadCommissionsCsv( referrals, productsData || [], referralCommissionPayout, clientEmail );
	}, [ downloadCommissionsCsv, referrals, productsData, clientEmail, referralCommissionPayout ] );

	const downloadCsvButton = (
		<Button variant="link" onClick={ handleDownloadCsv }>
			{ translate( 'Download CSV' ) }
		</Button>
	);

	const totalReferralCommissions = referralCommissionPayout?.total_commission;

	const totalPayouts = isSingleClient
		? findClientTotalCommission( referrals[ 0 ], referralCommissionPayout )
		: totalReferralCommissions;

	const hasPayouts = totalPayouts && totalPayouts > 0;

	return (
		<ConsolidatedStatsGroup className="consolidated-view">
			<ConsolidatedStatsCard
				value={ formatCurrency( totalPayouts ?? 0, 'USD' ) }
				footerText={
					isSingleClient
						? translate( 'All payouts for this client' )
						: translate( 'All time referral payouts' )
				}
				footerAction={ hasPayouts ? downloadCsvButton : undefined }
				popoverTitle={ translate( 'Total payouts' ) }
				popoverContent={ translate(
					'The exact amount your agency has been paid out for referrals.' +
						'{{br/}}{{br/}}{{a}}Learn more{{/a}}',
					{
						components: {
							a: (
								<Button
									variant="link"
									onClick={ () => showSupportGuide( AGENCY_EARNINGS_LEARN_MORE_LINK ) }
								/>
							),
							br: <br />,
						},
					}
				) }
				isLoading={ isLoading }
			/>
			<PayoutCards
				isFetching={ isFetching }
				previousQuarterExpectedCommission={ previousQuarterExpectedCommission }
				currentQuarterExpectedCommission={ currentQuarterExpectedCommission }
			/>
			<ConsolidatedStatsCard
				value={ pendingOrders }
				footerText={ translate( 'Pending referral orders' ) }
				popoverTitle={ translate( 'Pending orders' ) }
				popoverContent={ translate(
					'These are the number of pending referrals (unpaid carts). ' +
						'{{br/}}{{br/}}{{a}}Learn more{{/a}}',
					{
						components: {
							a: (
								<Button
									variant="link"
									onClick={ () => showSupportGuide( AGENCY_EARNINGS_LEARN_MORE_LINK ) }
								/>
							),
							br: <br />,
						},
					}
				) }
				isLoading={ isFetching }
			/>
		</ConsolidatedStatsGroup>
	);
}
