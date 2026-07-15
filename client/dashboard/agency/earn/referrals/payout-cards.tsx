import { formatCurrency } from '@automattic/number-formatters';
import { Button } from '@wordpress/components';
import { __, sprintf } from '@wordpress/i18n';
import ConsolidatedStatCard from './consolidated-stat-card';
import useGetPayoutData from './hooks/use-payout-data';

const AGENCY_EARNINGS_LEARN_MORE_LINK =
	'https://agencieshelp.automattic.com/knowledge-base/automattic-for-agencies-earnings/';

function PayoutAmount( {
	expectedCommission,
	activityWindow,
	payoutDate,
	isFetching,
	footerText,
	footerAction,
	popoverTitle,
	handleHalfQuarter,
}: {
	expectedCommission: number;
	activityWindow: string;
	payoutDate: string;
	isFetching: boolean;
	footerText: string;
	footerAction?: React.ReactNode;
	popoverTitle: string;
	handleHalfQuarter?: boolean;
} ) {
	return (
		<ConsolidatedStatCard
			value={ formatCurrency( expectedCommission, 'USD' ) }
			footerText={ footerText }
			footerAction={ footerAction }
			popoverTitle={ popoverTitle }
			popoverContent={
				<div className="payout-cards__description">
					<div>
						{ __(
							'When your client buys products or hosting from Automattic for Agencies, they are billed on the first of every month rather than immediately. We estimate the commission based on the active use for the current month.'
						) }
					</div>

					<div className="payout-cards__description-item">
						{ __( 'Payout range:' ) }
						<strong>{ activityWindow }</strong>
						{ handleHalfQuarter && (
							<div>
								{ sprintf(
									/* translators: %s is the current date, e.g. "Jan 5" */
									__( '(Earnings shown up to %s)' ),
									new Date().toLocaleString( 'default', {
										month: 'short',
										day: 'numeric',
									} )
								) }
							</div>
						) }
					</div>

					<div className="payout-cards__description-item">
						{ __( 'Payout date:' ) }
						<strong>{ payoutDate }*</strong>
					</div>

					<div>
						{ __(
							'*Commissions are paid quarterly, after a 60-day waiting period, excluding refunds and chargebacks.'
						) }
					</div>

					<div>
						<Button variant="link" href={ AGENCY_EARNINGS_LEARN_MORE_LINK } target="_blank">
							{ __( 'Learn more' ) }
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
	isWooPayments,
	footerAction,
}: {
	isFetching: boolean;
	previousQuarterExpectedCommission: number;
	currentQuarterExpectedCommission: number;
	isWooPayments?: boolean;
	footerAction?: React.ReactNode;
} ) {
	const {
		nextPayoutActivityWindow,
		nextPayoutDate,
		currentCyclePayoutDate,
		currentCycleActivityWindow,
		areNextAndCurrentPayoutDatesEqual,
		isFullQuarter,
	} = useGetPayoutData();

	const previousQuarterTitle = __( 'Estimated earnings in previous quarter' );

	const handleHalfQuarter = isWooPayments && ! isFullQuarter;

	const currentQuarterTitle = handleHalfQuarter
		? __( 'Estimated current quarter earnings to date' )
		: __( 'Estimated earnings in current quarter' );

	return (
		<>
			{ ! areNextAndCurrentPayoutDatesEqual && (
				<PayoutAmount
					expectedCommission={ previousQuarterExpectedCommission }
					activityWindow={ nextPayoutActivityWindow }
					payoutDate={ nextPayoutDate }
					isFetching={ isFetching }
					footerText={ previousQuarterTitle }
					footerAction={ footerAction }
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
				handleHalfQuarter={ handleHalfQuarter }
			/>
		</>
	);
}
