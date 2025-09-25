import { SelectDropdown } from '@automattic/components';
import { __ } from '@wordpress/i18n';
import { ForwardedRef, forwardRef, useCallback, useEffect, useState } from 'react';
import { useAnalytics } from '../../app/analytics';
import { FullPageScreenshot, PerformanceMetricsItemQueryResponse } from './core-web-vitals';
import MetricsInsight from './metrics-insight';
import { updateQueryParams } from 'calypso/performance-profiler/utils/query-params';
import { filterRecommendations, getMetricsNames, highImpactAudits } from './utils';

type InsightsSectionProps = {
	fullPageScreenshot: FullPageScreenshot;
	audits: Record< string, PerformanceMetricsItemQueryResponse >;
	url: string;
	isWpcom: boolean;
	hash: string;
	filter?: string;
	onRecommendationsFilterChange?: ( filter: string ) => void;
};

function InsightsSection( props: InsightsSectionProps, ref: ForwardedRef< HTMLDivElement > ) {
	const { audits, fullPageScreenshot, isWpcom, hash, filter, onRecommendationsFilterChange } =
		props;
	const [ selectedFilter, setSelectedFilter ] = useState( filter ?? 'all' );
	const { recordTracksEvent } = useAnalytics();

	const sortHighImpactAudits = ( a: string, b: string ) =>
		highImpactAudits.indexOf( b ) - highImpactAudits.indexOf( a );
	const filteredAudits = Object.keys( audits )
		.filter( ( key ) => filterRecommendations( selectedFilter, audits[ key ] ) )
		.sort( sortHighImpactAudits );
	const onFilter = useCallback(
		( option: { label: string; value: string } ) => {
			recordTracksEvent( 'calypso_performance_profiler_recommendations_filter_change', {
				filter: option.value,
			} );
			setSelectedFilter( option.value );
			if ( onRecommendationsFilterChange ) {
				onRecommendationsFilterChange( option.value );
			} else {
				updateQueryParams( { filter: option.value }, true );
			}
		},
		[ onRecommendationsFilterChange, recordTracksEvent ]
	);

	useEffect( () => {
		if ( filter && filter !== selectedFilter ) {
			setSelectedFilter( filter );
		}
	}, [ selectedFilter, filter ] );

	const metricsNames = getMetricsNames( __ );

	return (
		<div className="performance-profiler-insights-section" ref={ ref }>
			<div className="header">
				<div>
					<h2 className="title">{ __( 'Personalized Recommendations' ) }</h2>
					<p className="subtitle">
						{ getSubtitleText( selectedFilter, filteredAudits.length, __ ) }
					</p>
				</div>
				<div className="filter">
					<SelectDropdown
						value={ selectedFilter }
						initialSelected={ selectedFilter }
						onSelect={ onFilter }
						selectedText={
							selectedFilter === 'all'
								? __( 'All recommendations' )
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
					key={ key }
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

function getSubtitleText(
	selectedFilter: string,
	numRecommendations: number,
	translate: typeof __
) {
	const metricsNames = getMetricsNames( translate );

	if ( numRecommendations ) {
		if ( selectedFilter === 'all' ) {
			return __(
				'We found %(numRecommendations)d thing you can do for improving your page.',
				'We found %(numRecommendations)d things you can do for improving your page.',
				{
					args: { numRecommendations },
					count: numRecommendations,
				}
			);
		}
		return __(
			'We found %(numRecommendations)d thing you can do for improving %(metric)s.',
			'We found %(numRecommendations)d things you can do for improving %(metric)s.',
			{
				args: {
					numRecommendations,
					metric: metricsNames[ selectedFilter as keyof typeof metricsNames ]?.name,
				},
				count: numRecommendations,
			}
		);
	}

	if ( selectedFilter === 'all' ) {
		return __(
			"Great job! We didn't find any recommendations for improving the speed of your page."
		);
	}

	return __( "Great job! We didn't find any recommendations for improving %(metric)s.", {
		args: {
			metric: metricsNames[ selectedFilter as keyof typeof metricsNames ]?.name,
		},
	} );
}

export default forwardRef( InsightsSection );
