import { Card } from '@automattic/components';
import { useTranslate } from 'i18n-calypso';

import './style.scss';

const getCurrentQuarter = () => {
	const currentMonth = new Date().getMonth();
	const quarter = Math.ceil( ( currentMonth + 1 ) / 3 );
	return `Q${ quarter }`;
};

export default function MigrationsConsolidatedCommissions() {
	const translate = useTranslate();

	const data = {
		migrationCommissions: 300,
		sitesPendingReview: 2,
	}; // FIXME: Replace with real data

	return (
		<div className="consolidated-commissions">
			<Card compact>
				<div className="consolidated-commissions__value"> ${ data.migrationCommissions }</div>
				<div className="consolidated-commissions__label">
					{ translate( 'Migration commissions expected in %(currentQuarter)s', {
						args: { currentQuarter: getCurrentQuarter() },
					} ) }
				</div>
			</Card>
			<Card compact>
				<div className="consolidated-commissions__value">{ data.sitesPendingReview }</div>
				<div className="consolidated-commissions__label">
					{ translate( 'Sites pending review' ) }
				</div>
			</Card>
		</div>
	);
}
