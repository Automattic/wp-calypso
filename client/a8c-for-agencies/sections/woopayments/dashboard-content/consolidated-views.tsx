import { useTranslate, formatCurrency } from 'i18n-calypso';
import {
	ConsolidatedStatsCard,
	ConsolidatedStatsGroup,
} from 'calypso/a8c-for-agencies/components/consolidated-stats-card';
import useGetPayoutData from '../../referrals/hooks/use-get-payout-data';
import { useWooPaymentsContext } from '../context';

const WooPaymentsConsolidatedViews = () => {
	const translate = useTranslate();

	const { woopaymentsData, isLoadingWooPaymentsData } = useWooPaymentsContext();
	const totalCommission = woopaymentsData?.total?.payout ?? 0;
	const expectedCommission = woopaymentsData?.estimated?.payout ?? 0;

	const { nextPayoutActivityWindow, nextPayoutDate } = useGetPayoutData();

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
			<ConsolidatedStatsCard
				value={ formatCurrency( expectedCommission, 'USD' ) }
				footerText={ translate( 'Next estimated payout amount' ) }
				popoverTitle={ translate( 'Estimated amount' ) }
				popoverContent={ translate(
					'When your client buys products or hosting from Automattic for Agencies, they are billed on the first of every month rather than immediately. ' +
						'We estimate the commission based on the active use for the current month. ' +
						'{{br/}}{{br}}{{/br}}The next payout range is for:' +
						'{{br/}}{{b}}%(nextPayoutActivityWindow)s{{/b}}' +
						'{{br/}}{{br/}}{{a}}Learn more{{/a}} ↗',
					{
						components: {
							a: <a href={ learnMoreLink } target="_blank" rel="noreferrer noopener" />,
							br: <br />,
							b: <b />,
						},
						args: {
							nextPayoutActivityWindow,
						},
					}
				) }
				isLoading={ isLoadingWooPaymentsData }
			/>
			<ConsolidatedStatsCard
				value={ nextPayoutDate + '*' }
				footerText={ translate( 'Next estimated payout date' ) }
				popoverTitle={ translate( 'Estimated date' ) }
				popoverContent={ translate(
					'*Commissions are paid quarterly, after a 60-day waiting period, excluding refunds and chargebacks. ' +
						'Payout dates mark the start of processing, which may take a few extra days. Payments scheduled on weekends are processed the next business day. ' +
						'{{br/}}{{br/}}{{a}}Learn more{{/a}} ↗',
					{
						components: {
							a: <a href={ learnMoreLink } target="_blank" rel="noreferrer noopener" />,
							br: <br />,
						},
					}
				) }
			/>
		</ConsolidatedStatsGroup>
	);
};

export default WooPaymentsConsolidatedViews;
