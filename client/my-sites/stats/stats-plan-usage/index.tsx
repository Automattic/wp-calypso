import React from 'react';
import './style.scss';

interface StatsPlanUsageProps {
	limit: number;
}

const StatsPlanUsage: React.FC< StatsPlanUsageProps > = () => {
	const upgradeLink = '#';

	return (
		<div className="stats__plan-usage-wrapper">
			<div className="stats__plan-usage">
				<h3 className="stats__plan-usage-heading">Your Stats plan usage</h3>
				<div className="stats__plan-usage-progress">
					<div>9,000 / 10,000 views this month</div>
					<div>Restarts in 10 days</div>
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

export default StatsPlanUsage;
