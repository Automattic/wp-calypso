import { Card } from '@automattic/components';
import { useTranslate } from 'i18n-calypso';

import './style.scss';

export default function MigrationsConsolidatedCommissions() {
	const translate = useTranslate();

	const getCurrentQuarter = () => {
		const date = new Date();
		const quarter = Math.floor( ( date.getMonth() + 3 ) / 3 );
		switch ( quarter ) {
			case 1:
				return 'Q1';
			case 2:
				return 'Q2';
			case 3:
				return 'Q3';
			case 4:
				return 'Q4';
			default:
				return '';
		}
	};

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
