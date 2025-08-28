import { Tooltip } from '@automattic/components';
import { formatCurrency } from '@automattic/number-formatters';
import { useTranslate } from 'i18n-calypso';
import { useRef, useState } from 'react';
import TextPlaceholder from 'calypso/a8c-for-agencies/components/text-placeholder';
import useProductsQuery from 'calypso/a8c-for-agencies/data/marketplace/use-products-query';
import useGetConsolidatedPayoutData from '../hooks/use-get-consolidated-payout-data';
import useGetPayoutData from '../hooks/use-get-payout-data';
import type { Referral } from '../types';

export default function CommissionsColumn( { referral }: { referral: Referral } ) {
	const translate = useTranslate();
	const { data, isFetching } = useProductsQuery( false, false, true );
	const tooltipRef = useRef< HTMLSpanElement >( null );
	const [ showTooltip, setShowTooltip ] = useState( false );

	const { previousQuarterExpectedCommission, currentQuarterExpectedCommission } =
		useGetConsolidatedPayoutData( [ referral ], data );

	const { areNextAndCurrentPayoutDatesEqual } = useGetPayoutData();

	const totalPendingCommission = areNextAndCurrentPayoutDatesEqual
		? formatCurrency( previousQuarterExpectedCommission, 'USD' )
		: formatCurrency( previousQuarterExpectedCommission + currentQuarterExpectedCommission, 'USD' );

	if ( isFetching ) {
		return <TextPlaceholder />;
	}

	return (
		<>
			<span
				ref={ tooltipRef }
				onMouseEnter={ () => setShowTooltip( true ) }
				onMouseLeave={ () => setShowTooltip( false ) }
				role="button"
				tabIndex={ 0 }
			>
				{ totalPendingCommission }
			</span>
			<Tooltip
				context={ tooltipRef.current }
				isVisible={ showTooltip }
				position="bottom"
				showOnMobile
			>
				<div>
					{ ! areNextAndCurrentPayoutDatesEqual && (
						<div>
							{ translate( 'Previous quarter: %(amount)s', {
								args: { amount: formatCurrency( previousQuarterExpectedCommission, 'USD' ) },
							} ) }
						</div>
					) }
					<div>
						{ translate( 'Current quarter: %(amount)s', {
							args: { amount: formatCurrency( currentQuarterExpectedCommission, 'USD' ) },
						} ) }
					</div>
				</div>
			</Tooltip>
		</>
	);
}
