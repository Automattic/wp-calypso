import { Card } from '@automattic/components';
import { useTranslate } from 'i18n-calypso';
import { getSiteReviewStatus } from '../lib/utils';
import type { TaggedSite } from '../types';

import './style.scss';

const getQuarter = ( date = new Date() ) => {
	const currentMonth = date.getMonth();
	return Math.ceil( ( currentMonth + 1 ) / 3 );
};

export default function MigrationsConsolidatedCommissions( { items }: { items: TaggedSite[] } ) {
	const translate = useTranslate();

	const migrationCommissions =
		items.filter( ( item ) => {
			const tags = item.tags.map( ( tag ) => tag.name );
			// Consider only confirmed migrations for the current quarter
			return (
				getSiteReviewStatus( tags ) === 'confirmed' &&
				getQuarter( new Date( item.created_at ) ) === getQuarter()
			);
		} ).length * 100; // FIXME: Consider the maximum commission value when the MC tool is implemented

	const sitesPendingReview = items.filter( ( item ) => {
		const tags = item.tags.map( ( tag ) => tag.name );
		return getSiteReviewStatus( tags ) === 'pending';
	} ).length;

	const currentQuarter = getQuarter();

	return (
		<div className="consolidated-commissions">
			<Card compact>
				<div className="consolidated-commissions__value"> ${ migrationCommissions }</div>
				<div className="consolidated-commissions__label">
					{ translate( 'Migration commissions expected in Q%(currentQuarter)s', {
						args: { currentQuarter },
						comment: 'Quarterly commission value, where Q is the short form of "Quarter"',
					} ) }
				</div>
			</Card>
			<Card compact>
				<div className="consolidated-commissions__value">{ sitesPendingReview }</div>
				<div className="consolidated-commissions__label">
					{ translate( 'Sites pending review' ) }
				</div>
			</Card>
		</div>
	);
}
