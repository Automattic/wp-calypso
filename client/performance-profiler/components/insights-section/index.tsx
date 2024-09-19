import { SelectDropdown } from '@automattic/components';
import { useTranslate } from 'i18n-calypso';
import { ForwardedRef, forwardRef, useCallback, useEffect, useState } from 'react';
import {
	FullPageScreenshot,
	PerformanceMetricsItemQueryResponse,
} from 'calypso/data/site-profiler/types';
import { recordTracksEvent } from 'calypso/lib/analytics/tracks';
import { MetricsInsight } from 'calypso/performance-profiler/components/metrics-insight';
import { filterRecommendations, metricsNames } from 'calypso/performance-profiler/utils/metrics';
import { updateQueryParams } from 'calypso/performance-profiler/utils/query-params';
import './style.scss';

type InsightsSectionProps = {
	fullPageScreenshot: FullPageScreenshot;
	audits: Record< string, PerformanceMetricsItemQueryResponse >;
	url: string;
	isWpcom: boolean;
	hash: string;
	filter?: string;
	onRecommendationsFilterChange?: ( filter: string ) => void;
};

export const InsightsSection = forwardRef(
	( props: InsightsSectionProps, ref: ForwardedRef< HTMLDivElement > ) => {
		const translate = useTranslate();
		const { audits, fullPageScreenshot, isWpcom, hash, filter } = props;
		const [ selectedFilter, setSelectedFilter ] = useState( filter ?? 'all' );

		const sumMetricSavings = ( key: string ) =>
			Object.values( audits[ key ].metricSavings ?? {} ).reduce( ( acc, val ) => acc + val, 0 );

		const sortInsightKeys = ( a: string, b: string ) =>
			sumMetricSavings( b ) - sumMetricSavings( a );

		const filteredAudits = Object.keys( audits )
			.filter( ( key ) => filterRecommendations( selectedFilter, audits[ key ] ) )
			.sort( sortInsightKeys );
		const onFilter = useCallback( ( option: { label: string; value: string } ) => {
			setSelectedFilter( option.value );
			if ( props.onRecommendationsFilterChange ) {
				props.onRecommendationsFilterChange( option.value );
			} else {
				updateQueryParams( { filter: option.value }, true );
			}
		}, [] );

		useEffect( () => {
			if ( filter && filter !== selectedFilter ) {
				setSelectedFilter( filter );
			}
		}, [ selectedFilter, filter ] );

		return (
			<div className="performance-profiler-insights-section" ref={ ref }>
				<div className="header">
					<div>
						<h2 className="title">{ translate( 'Improve your site‘s performance' ) }</h2>
						<p className="subtitle">
							{ filteredAudits.length
								? translate(
										'We found %(quantity)d thing you can do for improving %(metric)s.',
										'We found %(quantity)d things you can do for improving %(metric)s.',
										{
											args: {
												quantity: filteredAudits.length,
												metric:
													selectedFilter === 'all'
														? translate( 'your site' )
														: metricsNames[ selectedFilter as keyof typeof metricsNames ]?.name,
											},
											count: filteredAudits.length,
										}
								  )
								: translate( "Great job! We didn't find any recommendations for improving %s.", {
										args: [
											selectedFilter === 'all'
												? translate( 'the speed of your site' )
												: metricsNames[ selectedFilter as keyof typeof metricsNames ]?.name,
										],
								  } ) }
						</p>
					</div>
					<div className="filter">
						<SelectDropdown
							value={ selectedFilter }
							initialSelected={ selectedFilter }
							onSelect={ onFilter }
							selectedText={
								selectedFilter === 'all'
									? translate( 'All recommendations' )
									: metricsNames[ selectedFilter as keyof typeof metricsNames ]?.name
							}
							selectedCount={ filteredAudits.length }
							options={ [
								{ label: 'All recommendations', value: 'all', count: Object.keys( audits ).length },
							].concat(
								Object.keys( metricsNames ).map( ( key ) => ( {
									label: metricsNames[ key as keyof typeof metricsNames ]?.name,
									value: key,
									count: Object.keys( audits ).filter( ( auditKey ) =>
										filterRecommendations( key, audits[ auditKey ] )
									).length,
								} ) )
							) }
							compact
						/>
					</div>
				</div>
				{ filteredAudits.map( ( key, index ) => (
					<MetricsInsight
						key={ `insight-${ index }` }
						insight={ { ...audits[ key ], id: key } }
						fullPageScreenshot={ fullPageScreenshot }
						index={ index }
						url={ props.url }
						isWpcom={ isWpcom }
						hash={ hash }
						onClick={ () =>
							recordTracksEvent( 'calypso_performance_profiler_insight_click', {
								url: props.url,
								key,
							} )
						}
					/>
				) ) }
			</div>
		);
	}
);
