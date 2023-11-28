import { formattedNumber } from '@automattic/components';
import classNames from 'classnames';
import React from 'react';
import './style.scss';

interface PlanUsageProps {
	limit?: number;
	usage?: number;
	daysToReset?: number;
}
interface StatsPlanUsageProps {
	siteId: number;
}

const PlanUsage: React.FC< PlanUsageProps > = ( {
	limit = 10000,
	usage = 0,
	daysToReset = 30,
} ) => {
	const upgradeLink = '#';
	const progressClassNames = classNames( 'plan-usage-progress', {
		'is-over-limit': usage >= limit,
	} );

	return (
		<div className="plan-usage">
			<h3 className="plan-usage-heading">Your Stats plan usage</h3>
			<div className={ progressClassNames }>
				<div>
					{ formattedNumber( usage ) } / { formattedNumber( limit ) } views this month
				</div>
				<div>Restarts in { daysToReset } days</div>
			</div>
			<div className="plan-usage-note">
				<span>
					<b>You've surpassed your limit the past month.</b> Do you want to increase your monthly
					views limit? <a href={ upgradeLink }>Upgrade now</a>
				</span>
			</div>
		</div>
	);
};

const StatsPlanUsage: React.FC< StatsPlanUsageProps > = () => {
	return (
		<div className="stats__plan-usage">
			<PlanUsage />
		</div>
	);
};

export default StatsPlanUsage;
