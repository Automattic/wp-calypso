import { formatCurrency } from '@automattic/number-formatters';
import { Button } from '@wordpress/components';
import { useTranslate } from 'i18n-calypso';
import {
	ConsolidatedStatsCard,
	ConsolidatedStatsGroup,
} from 'calypso/a8c-for-agencies/components/consolidated-stats-card';
import { AGENCY_EARNINGS_LEARN_MORE_LINK } from 'calypso/a8c-for-agencies/constants';
import useProductsQuery from 'calypso/a8c-for-agencies/data/marketplace/use-products-query';
import useFetchCommissions from 'calypso/a8c-for-agencies/data/referrals/use-fetch-commissions';
import useHelpCenter from 'calypso/a8c-for-agencies/hooks/use-help-center';
import useGetConsolidatedPayoutData from '../hooks/use-get-consolidated-payout-data';
import PayoutCards from './payout-cards';
import type { Referral } from '../types';

type ConsolidatedViewsProps = {
	referrals: Referral[];
};

export default function ConsolidatedViews( { referrals }: ConsolidatedViewsProps ) {
	const translate = useTranslate();
	const { data: productsData, isFetching } = useProductsQuery( false, true );
	const { data: commissionsData, isFetching: isFetchingCommissions } = useFetchCommissions();
	const { previousQuarterExpectedCommission, pendingOrders, currentQuarterExpectedCommission } =
		useGetConsolidatedPayoutData( referrals, productsData );
	const { showSupportGuide } = useHelpCenter();

	const totalPayouts = commissionsData?.total_commission;

	return (
		<ConsolidatedStatsGroup className="consolidated-view">
			<ConsolidatedStatsCard
				value={ formatCurrency( totalPayouts ?? 0, 'USD' ) }
				footerText={ translate( 'All time referral payouts' ) }
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
				isLoading={ isFetchingCommissions }
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
