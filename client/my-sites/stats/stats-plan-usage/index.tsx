import { formattedNumber } from '@automattic/components';
import classNames from 'classnames';
import { useTranslate } from 'i18n-calypso';
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
	const translate = useTranslate();

	const upgradeLink = '#';
	const progressClassNames = classNames( 'plan-usage-progress', {
		'is-over-limit': usage >= limit,
	} );

	return (
		<div className="plan-usage">
			<h3 className="plan-usage-heading">{ translate( 'Your Stats plan usage' ) }</h3>
			<div className={ progressClassNames }>
				<div>
					{ translate( '%(numberOfUsage)s / %(numberOfLimit)s views this month', {
						args: {
							numberOfUsage: formattedNumber( usage ),
							numberOfLimit: formattedNumber( limit ),
						},
					} ) }
				</div>
				<div>
					{ translate( 'Restarts in %(numberOfDays)d day', 'Restarts in %(numberOfDays)d days', {
						count: daysToReset,
						args: {
							numberOfDays: daysToReset,
						},
					} ) }
				</div>
			</div>
			<div className="plan-usage-note">
				<span>
					{ translate(
						"{{bold}}You've surpassed your limit the past month.{{/bold}} Do you want to increase your monthly views limit? {{link}}Upgrade now{{/link}}",
						{
							components: {
								bold: <b />,
								link: <a href={ upgradeLink } />,
							},
						}
					) }
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
