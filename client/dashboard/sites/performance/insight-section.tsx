import {
	__experimentalHStack as HStack,
	__experimentalVStack as VStack,
	__experimentalText as Text,
	Card,
	CardBody,
	CustomSelectControl,
} from '@wordpress/components';
import { __, _n, sprintf } from '@wordpress/i18n';
import { ForwardedRef, forwardRef, useCallback } from 'react';
import { useAnalytics } from '../../app/analytics';
import { FullPageScreenshot, PerformanceMetricsItemQueryResponse } from './core-metrics';
import MetricsInsight from './metrics-insight';
import { filterRecommendations, getMetricsNames, highImpactAudits, Metrics } from './utils';

export type CustomSelectControlOption = {
	key: Metrics;
	name: string;
	hint: string;
};

function getSubtitleText( selectedFilter: Metrics, numRecommendations: number ) {
	const metricsNames = getMetricsNames();

	if ( numRecommendations ) {
		if ( selectedFilter === 'overall' ) {
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

	if ( selectedFilter === 'overall' ) {
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

const sortHighImpactAudits = ( a: string, b: string ) =>
	highImpactAudits.indexOf( b ) - highImpactAudits.indexOf( a );

type InsightsSectionProps = {
	fullPageScreenshot: FullPageScreenshot;
	audits: Record< string, PerformanceMetricsItemQueryResponse >;
	url: string;
	isWpcom: boolean;
	hash: string;
	selectedFilter: Metrics;
	onFilterChange: ( filter: Metrics ) => void;
};

function InsightsSection( props: InsightsSectionProps, ref: ForwardedRef< HTMLDivElement > ) {
	const { audits, fullPageScreenshot, isWpcom, hash, selectedFilter, onFilterChange } = props;
	const { recordTracksEvent } = useAnalytics();

	const filteredAudits = Object.keys( audits )
		.filter( ( key ) => filterRecommendations( selectedFilter, audits[ key ] ) )
		.sort( sortHighImpactAudits );

	const onFilter = ( item: CustomSelectControlOption ) => {
		recordTracksEvent( 'calypso_performance_profiler_recommendations_filter_change', {
			filter: item.key,
		} );

		onFilterChange( item.key as Metrics );
	};

	const metricsNames = getMetricsNames();

	const options: CustomSelectControlOption[] = Object.keys( metricsNames ).map(
		( key: string ) => ( {
			name: metricsNames[ key as Metrics ]?.name,
			key: key as Metrics,
			hint: Object.keys( audits )
				.filter( ( auditKey ) => filterRecommendations( key as Metrics, audits[ auditKey ] ) )
				.length.toString(),
		} )
	);

	const getSelectedOption = useCallback( () => {
		return options.find( ( option: CustomSelectControlOption ) => option.key === selectedFilter );
	}, [ selectedFilter, options ] );

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

					<CustomSelectControl
						label={ __( 'Recommendations' ) }
						value={ getSelectedOption() }
						options={ options }
						hideLabelFromVision
						onChange={ ( { selectedItem } ) => onFilter( selectedItem ) }
						__next40pxDefaultSize
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
