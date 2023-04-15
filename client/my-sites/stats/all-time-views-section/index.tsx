import { Card } from '@automattic/components';
import classNames from 'classnames';
import { useTranslate } from 'i18n-calypso';
import { useMemo, useState } from 'react';
import { useSelector } from 'react-redux';
import QuerySiteStats from 'calypso/components/data/query-site-stats';
import SimplifiedSegmentedControl from 'calypso/components/segmented-control/simplified';
import { getSiteStatsViewSummary } from 'calypso/state/stats/lists/selectors';
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

	const toggleViews = ( option?: chartOption ) => {
		setChartOption( option?.value || 'total' );
	};

	const tableWrapperClass = classNames( 'stats__table-wrapper', {
		'is-loading': ! viewData,
	} );

	return (
		<div className="stats__all-time-views-section stats__modernized-stats-table">
			{ siteId && <QuerySiteStats statType="statsVisits" siteId={ siteId } query={ query } /> }

			<div className="highlight-cards">
				<h2 className="highlight-cards-heading">{ translate( 'All-time insights' ) }</h2>

				<div className="highlight-cards-list">
					<Card className="highlight-card">
						<div className="highlight-card-heading">
							<span>{ translate( 'Total views' ) }</span>
							{ viewData && (
								<SimplifiedSegmentedControl options={ monthViewOptions } onSelect={ toggleViews } />
							) }
						</div>

						<div className={ tableWrapperClass }>
							<StatsModulePlaceholder isLoading={ ! viewData } />
							<Months dataKey={ chartOption } data={ viewData } siteSlug={ slug } showYearTotal />
						</div>

						<StatsHeatMapLegend />
					</Card>
				</div>
			</div>
		</div>
	);
}
