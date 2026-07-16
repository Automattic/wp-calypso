import { formatCurrency } from '@automattic/number-formatters';
import { Tooltip } from '@wordpress/components';
import { sprintf, __ } from '@wordpress/i18n';
import { useMemo } from 'react';
import useConsolidatedPayoutData from './hooks/use-consolidated-payout-data';
import useGetPayoutData from './hooks/use-payout-data';
import type { Referral } from '@automattic/api-core';

export default function CommissionsCell( { referral }: { referral: Referral } ) {
	const referrals = useMemo( () => [ referral ], [ referral ] );
	const { previousQuarterExpectedCommission, currentQuarterExpectedCommission } =
		useConsolidatedPayoutData( referrals );
	const { areNextAndCurrentPayoutDatesEqual } = useGetPayoutData();

	const totalPendingCommission = areNextAndCurrentPayoutDatesEqual
		? formatCurrency( currentQuarterExpectedCommission, 'USD' )
		: formatCurrency( previousQuarterExpectedCommission + currentQuarterExpectedCommission, 'USD' );

	const tooltipText = [
		! areNextAndCurrentPayoutDatesEqual &&
			sprintf(
				/* translators: %s is a formatted currency amount */
				__( 'Previous quarter: %s' ),
				formatCurrency( previousQuarterExpectedCommission, 'USD' )
			),
		sprintf(
			/* translators: %s is a formatted currency amount */
			__( 'Current quarter: %s' ),
			formatCurrency( currentQuarterExpectedCommission, 'USD' )
		),
	]
		.filter( Boolean )
		.join( '\n' );

	return (
		<Tooltip text={ tooltipText }>
			<span>{ totalPendingCommission }</span>
		</Tooltip>
	);
}
