import {
	Card,
	SimplifiedSegmentedControl,
	StatsCard,
	LoadingPlaceholder,
} from '@automattic/components';
import { seen } from '@wordpress/icons';
import clsx from 'clsx';
import { useTranslate } from 'i18n-calypso';
import { useMemo, useState } from 'react';
import QuerySiteStats from 'calypso/components/data/query-site-stats';
import EmptyModuleCard from 'calypso/my-sites/stats/components/empty-module-card/empty-module-card';
import { STAT_TYPE_INSIGHTS_ALL_TIME_INSIGHTS } from 'calypso/my-sites/stats/constants';
import {
	StatsEmptyActionAI,
	StatsEmptyActionSocial,
} from 'calypso/my-sites/stats/features/modules/shared';
import StatsInfoArea from 'calypso/my-sites/stats/features/modules/shared/stats-info-area';
import { useShouldGateStats } from 'calypso/my-sites/stats/hooks/use-should-gate-stats';
import StatsCardUpsell from 'calypso/my-sites/stats/stats-card-upsell';
import StatsHeatMapLegend from 'calypso/my-sites/stats/stats-heap-map/legend';
import StatsModulePlaceholder from 'calypso/my-sites/stats/stats-module/placeholder';
import Months from 'calypso/my-sites/stats/stats-views/months';
import { useSelector } from 'calypso/state';
import {
	isRequestingSiteStatsForQuery,
	getSiteStatsViewSummary,
} from 'calypso/state/stats/lists/selectors';
import type { StatsStateProps } from 'calypso/my-sites/stats/features/modules/types';

import './style.scss';

type chartOption = {
	value: string;
	label: string;
	path: string;
};

export default function AllTimeViewsSection( { siteId, slug }: { siteId: number; slug: string } ) {
	const query = { quantity: -1, stat_fields: 'views' }; // duplicate from getSiteStatsViewSummary or vice versa
	const translate = useTranslate();
	const statType = 'statsVisits';
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

	const isRequestingData = useSelector( ( state: StatsStateProps ) =>
		isRequestingSiteStatsForQuery( state, siteId, statType, query )
	);

	const hasData = viewData && Object.keys( viewData ).length !== 0;

	return (
		<div className="stats__all-time-views-section stats__modernized-stats-table">
			{ siteId && <QuerySiteStats statType={ statType } siteId={ siteId } query={ query } /> }

			<div className="highlight-cards">
				<h3 className="highlight-cards-heading">{ translate( 'All-time insights' ) }</h3>

				{ isRequestingData && (
					<div className="highlight-cards-list">
						<Card className={ cardWrapperClassName }>
							<div className="highlight-card-heading">
								<h4>{ translate( 'Total views' ) }</h4>
							</div>
							<LoadingPlaceholder
								className="stats-card-skeleton__placeholder"
								width="100%"
								height="200px"
							/>
						</Card>
					</div>
				) }
				{ ! isRequestingData && ! hasData && ! shouldGateStats && (
					<StatsCard
						title={ translate( 'Total views' ) }
						isEmpty
						emptyMessage={
							<EmptyModuleCard
								icon={ seen }
								description={ translate(
									'Total and average daily views to your site will display here and learn about views patterns. Start creating and sharing!'
								) }
								cards={
									<>
										<StatsEmptyActionAI from="module_insights_top_views" />
										<StatsEmptyActionSocial from="module_insights_top_views" />
									</>
								}
							/>
						}
					/>
				) }

				{ ! isRequestingData && hasData && (
					<div className="highlight-cards-list">
						{ /*
								TODO: Refactor this card along with other similar structure cards to a component
								supporting overlay inside highlight-cards
							*/ }
						<Card className={ cardWrapperClassName }>
							<div className="highlight-card-heading">
								<h4 className="highlight-card-heading__title">
									<span>{ translate( 'Total views' ) }</span>
									<StatsInfoArea>
										{ translate(
											'Learn about views patterns by analysing total and average daily views to your site.'
										) }
									</StatsInfoArea>
								</h4>
								{ viewData && (
									<SimplifiedSegmentedControl
										options={ monthViewOptions }
										onSelect={ toggleViews }
									/>
								) }
							</div>

							<div className="highlight-card-content">
								<div className={ tableWrapperClass }>
									<StatsModulePlaceholder isLoading={ ! viewData } />
									<Months
										dataKey={ chartOption }
										data={ viewData }
										siteSlug={ slug }
										showYearTotal
									/>
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
				) }
			</div>
		</div>
	);
}
