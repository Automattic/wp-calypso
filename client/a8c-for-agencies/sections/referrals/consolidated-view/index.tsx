import { Card } from '@automattic/components';
import { useTranslate } from 'i18n-calypso';
import type { Referral } from '../types';

import './style.scss';

const getConsolidatedData = ( referrals: Referral[] ) => {
	const consolidatedData = {
		allTimeCommissions: 0,
		pendingOrders: 0,
		pendingCommission: 0,
	};

	referrals.forEach( ( referral ) => {
		consolidatedData.allTimeCommissions += referral.commissions;
		consolidatedData.pendingOrders += referral.statuses.filter(
			( status ) => status === 'pending'
		).length;
		if ( referral.statuses.includes( 'pending' ) ) {
			consolidatedData.pendingCommission += referral.commissions;
		}
	} );

	return consolidatedData;
};

export default function ConsolidatedViews( { referrals }: { referrals: Referral[] } ) {
	const translate = useTranslate();

	const date = new Date();
	const month = date.toLocaleString( 'default', { month: 'long' } );

	const { allTimeCommissions, pendingOrders, pendingCommission } = getConsolidatedData( referrals );

	return (
		<div className="consolidated-view">
			<Card compact>
				<div className="consolidated-view__value">{ `$${ allTimeCommissions }` }</div>
				<div className="consolidated-view__label">{ translate( 'All time commissions' ) }</div>
			</Card>
			<Card compact>
				<div className="consolidated-view__value">{ `$${ pendingCommission }` }</div>
				<div className="consolidated-view__label">
					{ translate( 'Commissions expected in %(month)s', {
						args: { month },
						comment: 'month is the name of the current month',
					} ) }
				</div>
			</Card>
			<Card compact>
				<div className="consolidated-view__value">{ pendingOrders }</div>
				<div className="consolidated-view__label">{ translate( 'Pending orders' ) }</div>
			</Card>
		</div>
	);
}
