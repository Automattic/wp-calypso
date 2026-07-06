import { formatCurrency } from '@automattic/number-formatters';
import { __experimentalHStack as HStack, Button } from '@wordpress/components';
import { createInterpolateElement } from '@wordpress/element';
import { __ } from '@wordpress/i18n';
import ConsolidatedStatCard from './consolidated-stat-card';
import PayoutCards from './payout-cards';
import type { WooPaymentsData } from '@automattic/api-core';

import './consolidated-views.scss';

const WOOPAYMENTS_LEARN_MORE_LINK =
	'https://agencieshelp.automattic.com/knowledge-base/earn-revenue-share-when-clients-use-woopayments/';

interface ConsolidatedViewsProps {
	woopaymentsData?: WooPaymentsData;
	isLoading: boolean;
}

export default function ConsolidatedViews( {
	woopaymentsData,
	isLoading,
}: ConsolidatedViewsProps ) {
	const totalCommission = woopaymentsData?.data?.total?.payout ?? 0;
	const previousQuarterExpectedCommission =
		woopaymentsData?.data?.estimated?.previous_quarter?.payout ?? 0;
	const currentQuarterExpectedCommission =
		woopaymentsData?.data?.estimated?.current_quarter?.payout ?? 0;

	return (
		<HStack className="woopayments-consolidated-views" alignment="stretch" spacing={ 4 } wrap>
			<ConsolidatedStatCard
				value={ formatCurrency( totalCommission, 'USD' ) }
				footerText={ __( 'Total WooPayments commissions paid' ) }
				popoverTitle={ __( 'Total WooPayments commissions paid' ) }
				popoverContent={ createInterpolateElement(
					__(
						'The total amount of transactions processed through WooPayments across all your client sites. <br/><br/><a>Learn more</a>'
					),
					{
						br: <br />,
						a: <Button variant="link" href={ WOOPAYMENTS_LEARN_MORE_LINK } target="_blank" />,
					}
				) }
				isLoading={ isLoading }
			/>
			<PayoutCards
				isWooPayments
				isFetching={ isLoading }
				previousQuarterExpectedCommission={ previousQuarterExpectedCommission }
				currentQuarterExpectedCommission={ currentQuarterExpectedCommission }
			/>
		</HStack>
	);
}
