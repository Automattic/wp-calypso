import { Card } from '@automattic/components';
import { formatCurrency } from '@automattic/format-currency';
import { useTranslate } from 'i18n-calypso';
import { useEffect, useState } from 'react';
import TextPlaceholder from 'calypso/a8c-for-agencies/components/text-placeholder';
import useProductsQuery from 'calypso/a8c-for-agencies/data/marketplace/use-products-query';
import { getConsolidatedData } from '../lib/commissions';
import type { Referral } from '../types';

import './style.scss';

export default function ConsolidatedViews( { referrals }: { referrals: Referral[] } ) {
	const translate = useTranslate();

	const date = new Date();
	const month = date.toLocaleString( 'default', { month: 'long' } );
	const { data, isFetching } = useProductsQuery( false, false, true );

	const [ consolidatedData, setConsolidatedData ] = useState( {
		allTimeCommissions: 0,
		pendingOrders: 0,
		pendingCommission: 0,
	} );

	useEffect( () => {
		if ( data?.length ) {
			const consolidatedData = getConsolidatedData( referrals, data || [] );
			setConsolidatedData( consolidatedData );
		}
	}, [ referrals, data ] );

	return (
		<div className="consolidated-view">
			<Card compact>
				<div className="consolidated-view__value">
					{ isFetching ? (
						<TextPlaceholder />
					) : (
						formatCurrency( consolidatedData.allTimeCommissions, 'USD' )
					) }
				</div>
				<div className="consolidated-view__label">{ translate( 'All time commissions' ) }</div>
			</Card>
			<Card compact>
				<div className="consolidated-view__value">
					{ isFetching ? (
						<TextPlaceholder />
					) : (
						formatCurrency( consolidatedData.pendingCommission, 'USD' )
					) }
				</div>
				<div className="consolidated-view__label">
					{ translate( 'Commissions expected in %(month)s', {
						args: { month },
						comment: 'month is the name of the current month',
					} ) }
				</div>
			</Card>
			<Card compact>
				<div className="consolidated-view__value">{ consolidatedData.pendingOrders }</div>
				<div className="consolidated-view__label">{ translate( 'Pending orders' ) }</div>
			</Card>
		</div>
	);
}
