import { Card } from '@automattic/components';
import { useTranslate } from 'i18n-calypso';
import { useMemo, useState } from 'react';
import { useSelector } from 'react-redux';
import QuerySiteStats from 'calypso/components/data/query-site-stats';
import SimplifiedSegmentedControl from 'calypso/components/segmented-control/simplified';
import { getSiteStatsViewSummary } from 'calypso/state/stats/lists/selectors';
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
		setChartOption( option?.value || '' );
	};

	return (
		<div className="stats__all-time-views-section">
			{ siteId && <QuerySiteStats statType="statsVisits" siteId={ siteId } query={ query } /> }

			<div className="highlight-cards">
				<h1 className="highlight-cards-heading">{ translate( 'All-time Insights' ) }</h1>

				<div className="highlight-cards-list">
					<Card className="highlight-card">
						<div className="highlight-card-heading">
							<span>{ translate( 'Total views' ) }</span>
							{ viewData && (
								<SimplifiedSegmentedControl options={ monthViewOptions } onSelect={ toggleViews } />
							) }
						</div>

						<div className="stats__all-time-views-table-wrapper">
							<StatsModulePlaceholder isLoading={ ! viewData } />
							<Months dataKey={ chartOption } data={ viewData } siteSlug={ slug } showYearTotal />
						</div>

						<div className="stats-views__key-container">
							<span className="stats-views__key-label">
								{ translate( 'Fewer Views', {
									context: 'Legend label in stats all-time views table',
								} ) }
							</span>
							<ul className="stats-views__key">
								<li className="stats-views__key-item level-1" />
								<li className="stats-views__key-item level-2" />
								<li className="stats-views__key-item level-3" />
								<li className="stats-views__key-item level-4" />
								<li className="stats-views__key-item level-5" />
							</ul>
							<span className="stats-views__key-label">
								{ translate( 'More Views', {
									context: 'Legend label in stats all-time views table',
								} ) }
							</span>
						</div>
					</Card>
				</div>
			</div>
		</div>
	);
}
