import {
	__experimentalHStack as HStack,
	__experimentalVStack as VStack,
	__experimentalText as Text,
	Card,
	CardBody,
} from '@wordpress/components';
import { SelectDropdown } from '@automattic/components';
import { __, _n, sprintf } from '@wordpress/i18n';
import { ForwardedRef, forwardRef, useCallback, useEffect, useState } from 'react';
import { useAnalytics } from '../../app/analytics';
import { FullPageScreenshot, PerformanceMetricsItemQueryResponse } from './core-metrics';
import MetricsInsight from './metrics-insight';
import {
	updateQueryParams,
	filterRecommendations,
	getMetricsNames,
	highImpactAudits,
} from './utils';

function getSubtitleText( selectedFilter: string, numRecommendations: number ) {
	const metricsNames = getMetricsNames();

	if ( numRecommendations ) {
		if ( selectedFilter === 'all' ) {
			return sprintf(
				/* translators: %d is the number of recommendations */
				_n(
					'We found %d thing you can do for improving your page.',
					'We found %d things you can do for improving your page.',
					numRecommendations
				),
				numRecommendations
			);
		}
		return sprintf(
			/* translators: %(numRecommendations)d is the number of recommendations, %(metric)s is the metric name */
			_n(
				'We found %(numRecommendations)d thing you can do for improving %(metric)s.',
				'We found %(numRecommendations)d things you can do for improving %(metric)s.',
				numRecommendations
			),
			{
				numRecommendations,
				metric: metricsNames[ selectedFilter as keyof typeof metricsNames ]?.name,
			}
		);
	}

	if ( selectedFilter === 'all' ) {
		return __(
			"Great job! We didn't find any recommendations for improving the speed of your page."
		);
	}

	return sprintf(
		/* translators: %(metric)s is the metric name */
		"Great job! We didn't find any recommendations for improving %(metric)s.",
		{
			metric: metricsNames[ selectedFilter as keyof typeof metricsNames ]?.name,
		}
	);
}

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

	const metricsNames = getMetricsNames();

	return (
		<Card ref={ ref }>
			<CardBody>
				<HStack justify="space-between">
					<VStack>
						<Text size={ 15 } weight={ 500 }>
							{ __( 'Personalized Recommendations' ) }
						</Text>
						<Text variant="muted">
							{ getSubtitleText( selectedFilter, filteredAudits.length ) }
						</Text>
					</VStack>
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
				</HStack>
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
			</CardBody>
		</Card>
	);
}

export default forwardRef( InsightsSection );
