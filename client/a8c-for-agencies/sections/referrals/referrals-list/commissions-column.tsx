import { Tooltip } from '@automattic/components';
import { formatCurrency } from '@automattic/format-currency';
import { useTranslate } from 'i18n-calypso';
import { useEffect, useState, useRef } from 'react';
import TextPlaceholder from 'calypso/a8c-for-agencies/components/text-placeholder';
import useProductsQuery from 'calypso/a8c-for-agencies/data/marketplace/use-products-query';
import useGetConsolidatedPayoutData from '../hooks/use-get-consolidated-payout-data';
import { getConsolidatedData } from '../lib/commissions';
import type { Referral, ReferralInvoice } from '../types';

export default function CommissionsColumn( {
	referral,
	referralInvoices,
}: {
	referral: Referral;
	referralInvoices: ReferralInvoice[];
} ) {
	const translate = useTranslate();

	const { data, isFetching } = useProductsQuery( false, false, true );

	const [ showPopover, setShowPopover ] = useState( false );
	const wrapperRef = useRef< HTMLDivElement | null >( null );

	const [ consolidatedData, setConsolidatedData ] = useState( {
		allTimeCommissions: 0,
		pendingOrders: 0,
		pendingCommission: 0,
	} );

	const { expectedCommission } = useGetConsolidatedPayoutData( [ referral ], data );

	useEffect( () => {
		if ( data?.length ) {
			const consolidatedData = getConsolidatedData( [ referral ], data || [], referralInvoices );
			setConsolidatedData( consolidatedData );
		}
	}, [ data, referral, referralInvoices ] );

	const allTimeCommissions = formatCurrency( consolidatedData.allTimeCommissions, 'USD' );
	const pendingCommission = formatCurrency( expectedCommission, 'USD' );

	return isFetching ? (
		<TextPlaceholder />
	) : (
		<>
			<span
				onMouseEnter={ () => setShowPopover( true ) }
				onMouseLeave={ () => setShowPopover( false ) }
				onMouseDown={ () => setShowPopover( false ) }
				role="button"
				tabIndex={ 0 }
				ref={ wrapperRef }
			>
				{ allTimeCommissions }
			</span>
			<Tooltip context={ wrapperRef.current } isVisible={ showPopover } position="bottom">
				<ul>
					<li>
						{ translate( 'All time: %(allTimeCommissions)s', {
							args: { allTimeCommissions },
						} ) }
					</li>
					<li>
						{ translate( 'Expected: %(pendingCommission)s', {
							args: { pendingCommission },
						} ) }
					</li>
				</ul>
			</Tooltip>
		</>
	);
}
