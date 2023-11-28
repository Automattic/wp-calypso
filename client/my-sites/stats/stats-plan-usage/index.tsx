import { formattedNumber } from '@automattic/components';
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

	return (
		<div className="stats__plan-usage-wrapper">
			<div className="stats__plan-usage">
				<h3 className="stats__plan-usage-heading">Your Stats plan usage</h3>
				<div className="stats__plan-usage-progress">
					<div>
						{ usage } / { formattedNumber( limit ) } views this month
					</div>
					<div>Restarts in { daysToReset } days</div>
				</div>
				<div className="stats__plan-usage-note">
					<span>
						<b>You've surpassed your limit the past month.</b> Do you want to increase your monthly
						views limit? <a href={ upgradeLink }>Upgrade now</a>
					</span>
				</div>
			</div>
		</div>
	);
};

const StatsPlanUsage: React.FC< StatsPlanUsageProps > = () => {
	return <PlanUsage />;
};

export default StatsPlanUsage;
