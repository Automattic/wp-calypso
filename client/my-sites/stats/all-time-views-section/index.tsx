import { Card, SimplifiedSegmentedControl } from '@automattic/components';
import clsx from 'clsx';
import { useTranslate } from 'i18n-calypso';
import { useMemo, useState } from 'react';
import QuerySiteStats from 'calypso/components/data/query-site-stats';
import { useSelector } from 'calypso/state';
import { getSiteStatsViewSummary } from 'calypso/state/stats/lists/selectors';
import { STAT_TYPE_INSIGHTS_ALL_TIME_INSIGHTS } from '../constants';
import { useShouldGateStats } from '../hooks/use-should-gate-stats';
import StatsCardUpsell from '../stats-card-upsell';
import StatsHeatMapLegend from '../stats-heap-map/legend';
import StatsModulePlaceholder from '../stats-module/placeholder';
import Months from '../stats-views/months';

import './style.scss';

type chartOption = {
	value: string;
	label: string;
	path: string;
};

export default function AllTimeViewsSection( { siteId, slug }: { siteId: number; slug: string } ) {
	const query = { quantity: -1, stat_fields: 'views' };
	const translate = useTranslate();
	const [ chartOption, setChartOption ] = useState( 'total' );
	const viewData = useSelector( ( state ) => getSiteStatsViewSummary( state, siteId ) );
	const monthViewOptions = useMemo( () => {
		return [
			{ value: 'total', label: translate( 'Months and years' ) },
			{ value: 'average', label: translate( 'Average per day' ) },
		];
	}, [ translate ] );
	const shouldGateStats = useShouldGateStats( STAT_TYPE_INSIGHTS_ALL_TIME_INSIGHTS );

	const toggleViews = ( option?: chartOption ) => {
		setChartOption( option?.value || 'total' );
	};

	const cardWrapperClassName = clsx( 'highlight-card', {
		'highlight-card--has-overlay': shouldGateStats,
	} );

	const tableWrapperClass = clsx( 'stats__table-wrapper', {
		'is-loading': ! viewData,
	} );

	return (
		<div className="stats__all-time-views-section stats__modernized-stats-table">
			{ siteId && <QuerySiteStats statType="statsVisits" siteId={ siteId } query={ query } /> }

			<div className="highlight-cards">
				<h3 className="highlight-cards-heading">{ translate( 'All-time insights' ) }</h3>

				<div className="highlight-cards-list">
					{ /* 
						TODO: Refactor this card along with other similar structure cards to a component
						supporting overlay inside highlight-cards
					*/ }
					<Card className={ cardWrapperClassName }>
						<div className="highlight-card-heading">
							<h4>{ translate( 'Total views' ) }</h4>
							{ viewData && (
								<SimplifiedSegmentedControl options={ monthViewOptions } onSelect={ toggleViews } />
							) }
						</div>

						<div className="highlight-card-content">
							<div className={ tableWrapperClass }>
								<StatsModulePlaceholder isLoading={ ! viewData } />
								<Months dataKey={ chartOption } data={ viewData } siteSlug={ slug } showYearTotal />
							</div>
							<StatsHeatMapLegend />
						</div>

						{ shouldGateStats && (
							<StatsCardUpsell
								statType={ STAT_TYPE_INSIGHTS_ALL_TIME_INSIGHTS }
								siteId={ siteId }
							/>
						) }
					</Card>
				</div>
			</div>
		</div>
	);
}
