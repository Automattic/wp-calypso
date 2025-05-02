import { formatCurrency } from '@automattic/number-formatters';
import { useTranslate } from 'i18n-calypso';
import {
	ConsolidatedStatsCard,
	ConsolidatedStatsGroup,
} from 'calypso/a8c-for-agencies/components/consolidated-stats-card';
import useProductsQuery from 'calypso/a8c-for-agencies/data/marketplace/use-products-query';
import useGetConsolidatedPayoutData from '../hooks/use-get-consolidated-payout-data';
import useGetPayoutData from '../hooks/use-get-payout-data';
import type { Referral } from '../types';

type ConsolidatedViewsProps = {
	referrals: Referral[];
	totalPayouts?: number;
};

export default function ConsolidatedViews( { referrals, totalPayouts }: ConsolidatedViewsProps ) {
	const translate = useTranslate();
	const { data: productsData, isFetching } = useProductsQuery( false, false, true );
	const { expectedCommission, pendingOrders } = useGetConsolidatedPayoutData(
		referrals,
		productsData
	);
	const { nextPayoutActivityWindow, nextPayoutDate } = useGetPayoutData();

	const learnMoreLink =
		'https://agencieshelp.automattic.com/knowledge-base/automattic-for-agencies-earnings/';

	return (
		<ConsolidatedStatsGroup className="consolidated-view">
			{ totalPayouts !== undefined && (
				<ConsolidatedStatsCard
					value={ formatCurrency( totalPayouts, 'USD' ) }
					footerText={ translate( 'All time referral payouts' ) }
					popoverTitle={ translate( 'Total payouts' ) }
					popoverContent={ translate(
						'The exact amount your agency has been paid out for referrals.' +
							'{{br/}}{{br/}}{{a}}Learn more{{/a}} ↗',
						{
							components: {
								a: <a href={ learnMoreLink } target="_blank" rel="noreferrer noopener" />,
								br: <br />,
							},
						}
					) }
				/>
			) }
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
				isLoading={ isFetching }
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
			<ConsolidatedStatsCard
				value={ pendingOrders }
				footerText={ translate( 'Pending referral orders' ) }
				popoverTitle={ translate( 'Pending orders' ) }
				popoverContent={ translate(
					'These are the number of pending referrals (unpaid carts). ' +
						'{{br/}}{{br/}}{{a}}Learn more{{/a}} ↗',
					{
						components: {
							a: <a href={ learnMoreLink } target="_blank" rel="noreferrer noopener" />,
							br: <br />,
						},
					}
				) }
				isLoading={ isFetching }
			/>
		</ConsolidatedStatsGroup>
	);
}
