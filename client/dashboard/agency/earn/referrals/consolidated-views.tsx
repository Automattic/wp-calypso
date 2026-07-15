import { formatCurrency } from '@automattic/number-formatters';
import { __experimentalHStack as HStack, Button } from '@wordpress/components';
import { createInterpolateElement } from '@wordpress/element';
import { __ } from '@wordpress/i18n';
import ConsolidatedStatCard from './consolidated-stat-card';
import useConsolidatedPayoutData from './hooks/use-consolidated-payout-data';
import PayoutCards from './payout-cards';
import type { Referral, ReferralCommissionPayout } from '@automattic/api-core';

import './consolidated-views.scss';

const AGENCY_EARNINGS_LEARN_MORE_LINK =
	'https://agencieshelp.automattic.com/knowledge-base/automattic-for-agencies-earnings/';

function findClientTotalCommission(
	referral: Referral,
	referralCommissionPayout?: ReferralCommissionPayout
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

interface ConsolidatedViewsProps {
	referrals: Referral[];
	referralCommissionPayout?: ReferralCommissionPayout;
	isSingleClient?: boolean;
	isLoading?: boolean;
}

export default function ConsolidatedViews( {
	referrals,
	referralCommissionPayout,
	isSingleClient,
	isLoading,
}: ConsolidatedViewsProps ) {
	const { previousQuarterExpectedCommission, currentQuarterExpectedCommission, pendingOrders } =
		useConsolidatedPayoutData( referrals );

	const totalPayouts = isSingleClient
		? findClientTotalCommission( referrals[ 0 ], referralCommissionPayout )
		: referralCommissionPayout?.total_commission;

	return (
		<HStack className="referrals-consolidated-views" alignment="stretch" spacing={ 4 } wrap>
			<ConsolidatedStatCard
				value={ formatCurrency( totalPayouts ?? 0, 'USD' ) }
				footerText={
					isSingleClient ? __( 'All payouts for this client' ) : __( 'All time referral payouts' )
				}
				popoverTitle={ __( 'Total payouts' ) }
				popoverContent={ createInterpolateElement(
					__(
						'The exact amount your agency has been paid out for referrals.<br/><br/><a>Learn more</a>'
					),
					{
						br: <br />,
						a: <Button variant="link" href={ AGENCY_EARNINGS_LEARN_MORE_LINK } target="_blank" />,
					}
				) }
				isLoading={ isLoading }
			/>
			<PayoutCards
				isFetching={ !! isLoading }
				previousQuarterExpectedCommission={ previousQuarterExpectedCommission }
				currentQuarterExpectedCommission={ currentQuarterExpectedCommission }
			/>
			<ConsolidatedStatCard
				value={ pendingOrders }
				footerText={ __( 'Pending referral orders' ) }
				popoverTitle={ __( 'Pending orders' ) }
				popoverContent={ createInterpolateElement(
					__(
						'These are the number of pending referrals (unpaid carts).<br/><br/><a>Learn more</a>'
					),
					{
						br: <br />,
						a: <Button variant="link" href={ AGENCY_EARNINGS_LEARN_MORE_LINK } target="_blank" />,
					}
				) }
				isLoading={ isLoading }
			/>
		</HStack>
	);
}
