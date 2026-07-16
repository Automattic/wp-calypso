import { formatCurrency } from '@automattic/number-formatters';
import { Button } from '@wordpress/components';
import { createInterpolateElement } from '@wordpress/element';
import { __ } from '@wordpress/i18n';
import {
	ConsolidatedStatsCard,
	ConsolidatedStatsGroup,
} from 'calypso/a8c-for-agencies/components/consolidated-stats-card';
import useHelpCenter from 'calypso/a8c-for-agencies/hooks/use-help-center';
import PayoutCards from '../../referrals/consolidated-view/payout-cards';
import { useWooPaymentsContext } from '../context';

const WooPaymentsConsolidatedViews = () => {
	const { showSupportGuide } = useHelpCenter();

	const { woopaymentsData, isLoadingWooPaymentsData } = useWooPaymentsContext();
	const totalCommission = woopaymentsData?.data?.total?.payout ?? 0;
	const previousQuarterExpectedCommission =
		woopaymentsData?.data?.estimated?.previous_quarter?.payout ?? 0;
	const currentQuarterExpectedCommission =
		woopaymentsData?.data?.estimated?.current_quarter?.payout ?? 0;

	return (
		<ConsolidatedStatsGroup className="consolidated-view">
			<ConsolidatedStatsCard
				value={ formatCurrency( totalCommission, 'USD' ) }
				footerText={ __( 'Total WooPayments commissions paid' ) }
				popoverTitle={ __( 'Total WooPayments commissions paid' ) }
				popoverContent={ createInterpolateElement(
					__(
						'The total amount of transactions processed through WooPayments across all your client sites. <br/><br/><a>Learn more</a>'
					),
					{
						br: <br />,
						a: (
							<Button
								variant="link"
								onClick={ () =>
									showSupportGuide(
										'https://agencieshelp.automattic.com/knowledge-base/earn-revenue-share-when-clients-use-woopayments/'
									)
								}
							/>
						),
					}
				) }
				isLoading={ isLoadingWooPaymentsData }
			/>
			<PayoutCards
				isWooPayments
				isFetching={ isLoadingWooPaymentsData }
				previousQuarterExpectedCommission={ previousQuarterExpectedCommission }
				currentQuarterExpectedCommission={ currentQuarterExpectedCommission }
			/>
		</ConsolidatedStatsGroup>
	);
};

export default WooPaymentsConsolidatedViews;
