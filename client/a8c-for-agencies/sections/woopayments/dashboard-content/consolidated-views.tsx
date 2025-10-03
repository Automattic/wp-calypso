import { formatCurrency } from '@automattic/number-formatters';
import { useTranslate } from 'i18n-calypso';
import {
	ConsolidatedStatsCard,
	ConsolidatedStatsGroup,
} from 'calypso/a8c-for-agencies/components/consolidated-stats-card';
import PayoutCards from '../../referrals/consolidated-view/payout-cards';
import { useWooPaymentsContext } from '../context';

const WooPaymentsConsolidatedViews = () => {
	const translate = useTranslate();

	const { woopaymentsData, isLoadingWooPaymentsData } = useWooPaymentsContext();
	const totalCommission = woopaymentsData?.data?.total?.payout ?? 0;
	const previousQuarterExpectedCommission =
		woopaymentsData?.data?.estimated?.previous_quarter?.payout ?? 0;
	const currentQuarterExpectedCommission =
		woopaymentsData?.data?.estimated?.current_quarter?.payout ?? 0;

	const learnMoreLink =
		'https://agencieshelp.automattic.com/knowledge-base/earn-revenue-share-when-clients-use-woopayments/';

	return (
		<ConsolidatedStatsGroup className="consolidated-view">
			<ConsolidatedStatsCard
				value={ formatCurrency( totalCommission, 'USD' ) }
				footerText={ translate( 'Total WooPayments commissions paid' ) }
				popoverTitle={ translate( 'Total WooPayments commissions paid' ) }
				popoverContent={ translate(
					'The total amount of transactions processed through WooPayments across all your client sites. ' +
						'{{br/}}{{br/}}{{a}}Learn more{{/a}} ↗',
					{
						components: {
							a: <a href={ learnMoreLink } target="_blank" rel="noreferrer noopener" />,
							br: <br />,
						},
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
