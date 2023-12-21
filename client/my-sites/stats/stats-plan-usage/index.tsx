import { formattedNumber } from '@automattic/components';
import classNames from 'classnames';
import { useTranslate } from 'i18n-calypso';
import React from 'react';
import usePlanUsageQuery from 'calypso/my-sites/stats/hooks/use-plan-usage-query';

import './style.scss';

interface PlanUsageProps {
	limit?: number | null;
	usage?: number;
	daysToReset?: number;
	overLimitMonths?: number | null;
	upgradeLink?: string;
}
interface StatsPlanUsageProps {
	siteId: number;
	isOdysseyStats: boolean;
}

const getStatsPurchaseURL = ( siteId: number | null, isOdysseyStats: boolean ) => {
	const from = isOdysseyStats ? 'jetpack' : 'calypso';
	const purchasePath = `/stats/purchase/${ siteId }?flags=stats/tier-upgrade-slider&from=${ from }-stats-tier-upgrade-usage-section&productType=commercial`;

	return purchasePath;
};

const PlanUsage: React.FC< PlanUsageProps > = ( {
	limit = 10000,
	usage = 0,
	daysToReset = 30,
	overLimitMonths = 0,
	upgradeLink,
} ) => {
	const translate = useTranslate();

	const isOverLimit = limit && usage >= limit;
	const progressClassNames = classNames( 'plan-usage-progress', {
		'is-over-limit': isOverLimit,
	} );
	const progressWidthInPercentage = limit ? ( usage / limit ) * 100 : 0;

	// 0, 1, 2, or greater than 2
	let overLimitMonthsText = '';

	if ( overLimitMonths && overLimitMonths === 1 ) {
		overLimitMonthsText = translate(
			"{{bold}}You've surpassed your limit the past month.{{/bold}} ",
			{
				components: {
					bold: <b />,
				},
			}
		) as string;
	}

	if ( overLimitMonths && overLimitMonths >= 2 ) {
		overLimitMonthsText = translate(
			"{{bold}}You've surpassed your limit for two consecutive months already.{{/bold}} ",
			{
				components: {
					bold: <b />,
				},
			}
		) as string;
	}

	const upgradeNote = translate(
		'Do you want to increase your monthly views limit? {{link}}Upgrade now{{/link}}',
		{
			components: {
				link: <a href={ upgradeLink } />,
			},
		}
	);

	return (
		<div className="plan-usage">
			<h3 className="plan-usage-heading">{ translate( 'Your Stats plan usage' ) }</h3>
			<div className={ progressClassNames }>
				<div
					className="plan-usage-progress-bar"
					style={ { width: `${ progressWidthInPercentage }%` } }
				></div>
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
					{ overLimitMonthsText } { upgradeNote }
				</span>
			</div>
		</div>
	);
};

const StatsPlanUsage: React.FC< StatsPlanUsageProps > = ( { siteId, isOdysseyStats } ) => {
	const upgradeLink = getStatsPurchaseURL( siteId, isOdysseyStats );

	const { data } = usePlanUsageQuery( siteId );

	// If there's no limit, don't show the component.
	// Site with legacy plans or no plans at all will have a null limit.
	if ( data?.views_limit === null ) {
		return null;
	}

	return (
		<div className="stats__plan-usage">
			<PlanUsage
				limit={ data?.views_limit }
				usage={ data?.current_usage?.views_count }
				daysToReset={ data?.current_usage?.days_to_reset }
				overLimitMonths={ data?.over_limit_months }
				upgradeLink={ upgradeLink }
			/>
		</div>
	);
};

export default StatsPlanUsage;
