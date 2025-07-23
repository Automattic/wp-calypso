import { formatCurrency } from '@automattic/number-formatters';
import { Button } from '@wordpress/components';
import { useTranslate } from 'i18n-calypso';
import { ConsolidatedStatsCard } from 'calypso/a8c-for-agencies/components/consolidated-stats-card';
import { AGENCY_EARNINGS_LEARN_MORE_LINK } from 'calypso/a8c-for-agencies/constants';
import useGetPayoutData from '../hooks/use-get-payout-data';

import './style.scss';

function PayoutAmount( {
	expectedCommission,
	activityWindow,
	payoutDate,
	isFetching,
	footerText,
	popoverTitle,
}: {
	expectedCommission: number;
	activityWindow: string;
	payoutDate: string;
	isFetching: boolean;
	footerText: string;
	popoverTitle: string;
} ) {
	const translate = useTranslate();

	return (
		<ConsolidatedStatsCard
			value={ formatCurrency( expectedCommission, 'USD' ) }
			footerText={ footerText }
			popoverTitle={ popoverTitle }
			popoverContent={
				<div className="payout-cards__description">
					<div>
						{ translate(
							'When your client buys products or hosting from Automattic for Agencies, they are billed on the first of every month rather than immediately. We estimate the commission based on the active use for the current month.'
						) }
					</div>

					<div className="payout-cards__description-item">
						{ translate( 'Payout range:' ) }
						<strong>{ activityWindow }</strong>
					</div>

					<div className="payout-cards__description-item">
						{ translate( 'Payout date:' ) }
						<strong>{ payoutDate }*</strong>
					</div>

					<div>
						{ translate(
							'*Commissions are paid quarterly, after a 60-day waiting period, excluding refunds and chargebacks.'
						) }
					</div>

					<div>
						<Button
							href={ AGENCY_EARNINGS_LEARN_MORE_LINK }
							target="_blank"
							rel="noreferrer noopener"
							variant="link"
						>
							{ translate( 'Learn more' ) } ↗
						</Button>
					</div>
				</div>
			}
			isLoading={ isFetching }
		/>
	);
}

export default function PayoutCards( {
	isFetching,
	previousQuarterExpectedCommission,
	currentQuarterExpectedCommission,
}: {
	isFetching: boolean;
	previousQuarterExpectedCommission: number;
	currentQuarterExpectedCommission: number;
} ) {
	const translate = useTranslate();

	const {
		nextPayoutActivityWindow,
		nextPayoutDate,
		currentCyclePayoutDate,
		currentCycleActivityWindow,
		areNextAndCurrentPayoutDatesEqual,
	} = useGetPayoutData();

	const previousQuarterTitle = translate( 'Estimated earnings in previous quarter' );
	const currentQuarterTitle = translate( 'Estimated earnings in current quarter' );

	return (
		<>
			{ ! areNextAndCurrentPayoutDatesEqual && (
				<PayoutAmount
					expectedCommission={ previousQuarterExpectedCommission }
					activityWindow={ nextPayoutActivityWindow }
					payoutDate={ nextPayoutDate }
					isFetching={ isFetching }
					footerText={ previousQuarterTitle }
					popoverTitle={ previousQuarterTitle }
				/>
			) }
			<PayoutAmount
				expectedCommission={ currentQuarterExpectedCommission }
				activityWindow={ currentCycleActivityWindow }
				payoutDate={ currentCyclePayoutDate }
				isFetching={ isFetching }
				footerText={ currentQuarterTitle }
				popoverTitle={ currentQuarterTitle }
			/>
		</>
	);
}
