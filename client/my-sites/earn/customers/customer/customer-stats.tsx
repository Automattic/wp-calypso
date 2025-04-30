import { Card } from '@automattic/components';
import { formatCurrency } from '@automattic/number-formatters';
import { payment, chartBar } from '@wordpress/icons';
import { Subscriber } from '../../types';

import '@automattic/components/src/highlight-cards/style.scss';

type CustomerStatsProps = {
	customer: Subscriber;
};

const CustomerStats = ( { customer }: CustomerStatsProps ) => {
	return (
		<div className="customer__stats">
			<div className="customer__stats-list highlight-cards-list">
				<Card className="highlight-card customer__stats-card">
					<div className="highlight-card-icon customer__stats-card-icon">{ payment }</div>
					<div className="highlight-card-heading customer__stats-card-heading">Last Payment</div>
					<div className="highlight-card-count customer__stats-card-count">
						<span
							className="highlight-card-count-value customer__stats-card-value"
							title={ String( customer.plan.renewal_price ) }
						>
							{ formatCurrency( customer.plan.renewal_price, customer.plan.currency ) }
						</span>
					</div>
				</Card>
				<Card className="highlight-card customer__stats-card">
					<div className="highlight-card-icon customer__stats-card-icon">{ chartBar }</div>
					<div className="highlight-card-heading customer__stats-card-heading">Total Spent</div>
					<div className="highlight-card-count customer__stats-card-count">
						<span
							className="highlight-card-count-value customer__stats-card-value"
							title={ String( customer.all_time_total ) }
						>
							{ formatCurrency( customer.all_time_total, customer.plan.currency ) }
						</span>
					</div>
				</Card>
			</div>
		</div>
	);
};

export default CustomerStats;
