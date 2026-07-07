import { Card } from '@automattic/components';
import { __, sprintf } from '@wordpress/i18n';
import type { TaggedSite } from '../types';

import './style.scss';

const getQuarter = ( date = new Date() ) => {
	const currentMonth = date.getMonth();
	return Math.ceil( ( currentMonth + 1 ) / 3 );
};

export default function MigrationsConsolidatedCommissions( { items }: { items: TaggedSite[] } ) {
	const migrationCommissions =
		items.filter( ( item ) => {
			// Consider only verified migrations for the current quarter
			return (
				item.incentive_status === 'verified' &&
				getQuarter( new Date( item.created_at ) ) === getQuarter()
			);
		} ).length * 100; // FIXME: Consider the maximum commission value when the MC tool is implemented

	const sitesPendingReview = items.filter( ( item ) => {
		return item.incentive_status === 'pending';
	} ).length;

	const currentQuarter = getQuarter();

	return (
		<div className="consolidated-commissions">
			<Card compact>
				<div className="consolidated-commissions__value"> ${ migrationCommissions }</div>
				<div className="consolidated-commissions__label">
					{ sprintf(
						/* translators: %d: the current quarter number. Q is the short form of "Quarter". */
						__( 'Migration commissions expected in Q%d' ),
						currentQuarter
					) }
				</div>
			</Card>
			<Card compact>
				<div className="consolidated-commissions__value">{ sitesPendingReview }</div>
				<div className="consolidated-commissions__label">{ __( 'Sites pending review' ) }</div>
			</Card>
		</div>
	);
}
