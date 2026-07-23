import { formatCurrency } from '@automattic/number-formatters';
import { __experimentalVStack as VStack } from '@wordpress/components';
import { __, sprintf } from '@wordpress/i18n';
import InlineSupportLink from '../../../components/inline-support-link';
import { formatDate } from '../../../utils/datetime';
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
	locale,
}: {
	expectedCommission: number;
	activityWindow: string;
	payoutDate: string;
	isFetching: boolean;
	footerText: string;
	footerAction?: React.ReactNode;
	popoverTitle: string;
	handleHalfQuarter?: boolean;
	locale?: string;
} ) {
	return (
		<ConsolidatedStatCard
			value={ formatCurrency( expectedCommission, 'USD' ) }
			footerText={ footerText }
			footerAction={ footerAction }
			popoverTitle={ popoverTitle }
			popoverContent={
				<VStack spacing={ 3 }>
					<div>
						{ __(
							'When your client buys products or hosting from Automattic for Agencies, they are billed on the first of every month rather than immediately. We estimate the commission based on the active use for the current month.'
						) }
					</div>

					<VStack spacing={ 1 }>
						<span>{ __( 'Payout range:' ) }</span>
						<strong>{ activityWindow }</strong>
						{ handleHalfQuarter && (
							<div>
								{ sprintf(
									/* translators: %s is the current date, e.g. "Jan 5" */
									__( '(Earnings shown up to %s)' ),
									formatDate( new Date(), locale ?? 'en', {
										month: 'short',
										day: 'numeric',
									} )
								) }
							</div>
						) }
					</VStack>

					<VStack spacing={ 1 }>
						<span>{ __( 'Payout date:' ) }</span>
						<strong>{ payoutDate }*</strong>
					</VStack>

					<div>
						{ __(
							'*Commissions are paid quarterly, after a 60-day waiting period, excluding refunds and chargebacks.'
						) }
					</div>

					<div>
						<InlineSupportLink
							supportLink={ AGENCY_EARNINGS_LEARN_MORE_LINK }
							forceOpenInHelpCenter
						>
							{ __( 'Learn more' ) }
						</InlineSupportLink>
					</div>
				</VStack>
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
	locale,
}: {
	isFetching: boolean;
	previousQuarterExpectedCommission: number;
	currentQuarterExpectedCommission: number;
	isWooPayments?: boolean;
	footerAction?: React.ReactNode;
	locale?: string;
} ) {
	const {
		nextPayoutActivityWindow,
		nextPayoutDate,
		currentCyclePayoutDate,
		currentCycleActivityWindow,
		areNextAndCurrentPayoutDatesEqual,
		isFullQuarter,
	} = useGetPayoutData( locale );

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
					locale={ locale }
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
				locale={ locale }
			/>
		</>
	);
}
