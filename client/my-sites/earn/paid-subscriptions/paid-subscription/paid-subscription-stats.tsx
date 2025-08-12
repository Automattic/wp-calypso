import { Card } from '@automattic/components';
import { formatCurrency } from '@automattic/number-formatters';
import { payment, chartBar } from '@wordpress/icons';
import { useTranslate } from 'i18n-calypso';
import { PaidSubscription } from '../../types';

import 'calypso/my-sites/stats/components/highlight-cards/style.scss';

type CustomerStatsProps = {
	paidSubscription: PaidSubscription;
};

const PaidSubscriptionStats = ( { paidSubscription }: CustomerStatsProps ) => {
	const translate = useTranslate();

	return (
		<div className="paid-subscription__stats">
			<div className="paid-subscription__stats-list highlight-cards-list">
				<Card className="highlight-card paid-subscription__stats-card">
					<div className="highlight-card-icon paid-subscription__stats-card-icon">{ payment }</div>
					<div className="highlight-card-heading paid-subscription__stats-card-heading">
						{ translate( 'Last Payment' ) }
					</div>
					<div className="highlight-card-count paid-subscription__stats-card-count">
						<span
							className="highlight-card-count-value paid-subscription__stats-card-value"
							title={ String( paidSubscription.plan.renewal_price ) }
						>
							{ formatCurrency(
								paidSubscription.plan.renewal_price,
								paidSubscription.plan.currency
							) }
						</span>
					</div>
				</Card>
				<Card className="highlight-card paid-subscription__stats-card">
					<div className="highlight-card-icon paid-subscription__stats-card-icon">{ chartBar }</div>
					<div className="highlight-card-heading paid-subscription__stats-card-heading">
						{ translate( 'Total Spent' ) }
					</div>
					<div className="highlight-card-count paid-subscription__stats-card-count">
						<span
							className="highlight-card-count-value paid-subscription__stats-card-value"
							title={ String( paidSubscription.all_time_total ) }
						>
							{ formatCurrency( paidSubscription.all_time_total, paidSubscription.plan.currency ) }
						</span>
					</div>
				</Card>
			</div>
		</div>
	);
};

export default PaidSubscriptionStats;
