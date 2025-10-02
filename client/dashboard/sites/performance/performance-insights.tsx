import { Metrics } from '@automattic/api-core';
import {
	__experimentalHStack as HStack,
	__experimentalVStack as VStack,
	CustomSelectControl,
} from '@wordpress/components';
import { useViewportMatch } from '@wordpress/compose';
import { __, _n, sprintf } from '@wordpress/i18n';
import { useCallback, useMemo } from 'react';
import { useAnalytics } from '../../app/analytics';
import { Text } from '../../components/text';
import { metricsNames } from '../../utils/site-performance';

export interface PerformanceMetricsItemQueryResponse {
	id: string;
	title?: string;
	description?: string;
	type: 'warning' | 'fail';
	displayValue?: string;
	details?: PerformanceMetricsDetailsQueryResponse;
	metricSavings?: { FCP?: number; LCP?: number; CLS?: number; INP?: number };
}

export interface PerformanceMetricsDetailsQueryResponse {
	type: 'table' | 'opportunity' | 'list' | 'criticalrequestchain';
	headings?: Array< { key: string; label: string; valueType: string } >;
	items?: Array< {
		[ key: string ]: string | number | { [ key: string ]: unknown };
	} >;
	chains?: Array< { [ key: string ]: unknown } >;
}

export type CustomSelectControlOption = {
	key: Metrics;
	name: string;
	hint: string;
};

export const filterRecommendations = (
	selectedFilter: Metrics,
	audit?: PerformanceMetricsItemQueryResponse
) => {
	return (
		selectedFilter === 'overall_score' ||
		audit?.metricSavings?.hasOwnProperty(
			selectedFilter.toUpperCase() as keyof typeof audit.metricSavings
		)
	);
};

const highImpactAudits = [
	'render-blocking-resources',
	'uses-responsive-images',
	'uses-optimized-images',
	'offscreen-images',
	'server-response-time',
	'mainthread-work-breakdown',
	'largest-contentful-paint-element',
];

function getSubtitleText( selectedFilter: Metrics, numRecommendations: number ) {
	if ( numRecommendations ) {
		if ( selectedFilter === 'overall_score' ) {
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

	if ( selectedFilter === 'overall_score' ) {
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

export default function PerformanceInsights( {
	audits,
	selectedFilter,
	onFilterChange,
}: {
	audits: Record< string, PerformanceMetricsItemQueryResponse >;
	selectedFilter: Metrics;
	onFilterChange: ( filter: Metrics ) => void;
} ) {
	const { recordTracksEvent } = useAnalytics();
	const isDesktop = useViewportMatch( 'medium' );
	const onFilter = ( item: CustomSelectControlOption ) => {
		recordTracksEvent( 'calypso_dashboard_performance_profiler_recommendations_filter_change', {
			filter: item.key,
		} );

		onFilterChange( item.key as Metrics );
	};

	const options: CustomSelectControlOption[] = Object.keys( metricsNames ).map( ( key: string ) => {
		const metricKey = key as Metrics;
		let label = metricsNames[ metricKey ]?.name;

		if ( metricKey === 'overall_score' ) {
			label = __( 'All recommendations' );
		}

		return {
			name: label,
			key: metricKey,
			hint: Object.keys( audits )
				.filter( ( auditKey ) => filterRecommendations( metricKey, audits[ auditKey ] ) )
				.length.toString(),
		};
	} );

	const getSelectedOption = useCallback( () => {
		return options.find( ( option: CustomSelectControlOption ) => option.key === selectedFilter );
	}, [ selectedFilter, options ] );

	const filteredAudits = useMemo( () => {
		return Object.keys( audits )
			.filter( ( key ) => filterRecommendations( selectedFilter, audits[ key ] ) )
			.sort( sortHighImpactAudits );
	}, [ audits, selectedFilter ] );

	return (
		<VStack spacing={ 4 }>
			<HStack
				spacing={ 4 }
				justify={ isDesktop ? 'space-between' : 'flex-start' }
				alignment="flex-start"
				wrap
			>
				<VStack>
					<Text size={ 15 } weight={ 500 } as="h2">
						{ __( 'Personalized recommendations' ) }
					</Text>
					<Text variant="muted">{ getSubtitleText( selectedFilter, filteredAudits.length ) }</Text>
				</VStack>
				<div style={ { width: isDesktop ? '250px' : '100%' } }>
					<CustomSelectControl
						label={ __( 'Recommendations' ) }
						value={ getSelectedOption() }
						options={ options }
						hideLabelFromVision
						onChange={ ( { selectedItem } ) => onFilter( selectedItem ) }
						__next40pxDefaultSize
					/>
				</div>
			</HStack>
			<VStack>
				<Text>Recommendation Section</Text>
				{ filteredAudits.map( ( key ) => (
					<Text key={ key }>{ key }</Text>
				) ) }
			</VStack>
		</VStack>
	);
}
