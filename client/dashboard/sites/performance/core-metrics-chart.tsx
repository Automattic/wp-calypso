import { LineChart } from '@automattic/charts';
import { __experimentalHStack as HStack } from '@wordpress/components';
import { useViewportMatch } from '@wordpress/compose';
import { __, sprintf } from '@wordpress/i18n';
import { Notice } from '../../components/notice';
import { Text } from '../../components/text';
import {
	Valuation,
	getColorForStatus,
	mapThresholdsToStatus,
	metricsNames,
} from '../../utils/site-performance';
import defaultHistory from './history';
import type { SitePerformanceReport, SitePerformanceHistory, Metrics } from '@automattic/api-core';

const formatUnit = ( metric: Metrics, value: number | string ) => {
	const num = parseFloat( value as string );
	if ( [ 'lcp', 'fcp', 'ttfb' ].includes( metric ) ) {
		return Number( Number( num / 1000 ).toFixed( 2 ) );
	}
	return num;
};

const StatusIndicator = ( { valuation }: { valuation: Valuation } ) => {
	const innerSvg: Record< Valuation, React.ReactNode > = {
		good: <rect x="1" y="1" width="10" height="10" rx="5" />,
		needsImprovement: (
			<path d="M5.56292 0.786741C5.75342 0.443836 6.24658 0.443837 6.43708 0.786742L11.5873 10.0572C11.7725 10.3904 11.5315 10.8 11.1502 10.8H0.849757C0.468515 10.8 0.227531 10.3904 0.412679 10.0572L5.56292 0.786741Z" />
		),
		bad: <rect x="1" y="1" width="10" height="10" rx="2" />,
	};

	return (
		<svg
			width="12"
			height="12"
			viewBox="0 0 12 12"
			fill={ getColorForStatus( valuation ) }
			xmlns="http://www.w3.org/2000/svg"
		>
			{ innerSvg[ valuation ] }
		</svg>
	);
};

const MetricLabel = ( {
	indicator,
	label,
	value,
}: {
	indicator: Valuation;
	label: string;
	value: string;
} ) => {
	return (
		<HStack justify="flex-start" alignment="center" expanded={ false }>
			<StatusIndicator valuation={ indicator } />
			<Text size="small">{ label }</Text>
			<Text>{ value }</Text>
		</HStack>
	);
};

const useMetricData = (
	metric: Metrics,
	valuation: Valuation,
	history?: SitePerformanceHistory
) => {
	const dates = history?.collection_period ?? [];
	const values = history?.metrics[ metric ] ?? [];
	if ( ! dates.length || ! values.length ) {
		return null;
	}

	const color = getColorForStatus( valuation );
	const weeksToShow = 8;
	const data = [];
	for ( let i = dates.length - 1; i > Math.max( 0, dates.length - 1 - weeksToShow ); i-- ) {
		const date = dates[ i ];
		const formattedDate =
			typeof date === 'string'
				? date
				: [
						date.year,
						date.month.toString().padStart( 2, '0' ),
						date.day.toString().padStart( 2, '0' ),
				  ].join( '-' );

		data.push( {
			date: new Date( formattedDate ),
			value: formatUnit( metric, values[ i ] ),
		} );
	}

	return [
		{
			label: metricsNames[ metric ].shortName,
			data,
			options: {
				stroke: color,
			},
		},
	];
};

export default function CoreMetricsChart( {
	report,
	activeTab,
	metricsThresholds,
}: {
	history?: SitePerformanceHistory;
	report: SitePerformanceReport;
	activeTab: Metrics;
	metricsThresholds: Record< Metrics, { good: number; needsImprovement: number; bad: number } >;
} ) {
	const { good, needsImprovement, bad } = metricsThresholds[ activeTab ];
	const isDesktop = useViewportMatch( 'medium' );
	const data = useMetricData(
		activeTab,
		mapThresholdsToStatus( activeTab, report[ activeTab ] ),
		defaultHistory
		// report.history
	);

	const displayUnit = () => {
		if ( [ 'lcp', 'fcp', 'ttfb' ].includes( activeTab ) ) {
			return 's';
		}
		if ( [ 'inp', 'tbt' ].includes( activeTab ) ) {
			return 'ms';
		}
		return '';
	};

	const formatThresholdValue = ( isOverall: boolean, valuation: Valuation ) => {
		if ( valuation === 'good' ) {
			return isOverall
				? sprintf( '(90–%(to)s)', { to: formatUnit( activeTab, good ) } )
				: sprintf( '(0–%(to)s%(unit)s)', {
						to: formatUnit( activeTab, good ),
						unit: displayUnit(),
				  } );
		}

		if ( valuation === 'needsImprovement' ) {
			return isOverall
				? sprintf( '(50–%(to)s)', { to: formatUnit( activeTab, needsImprovement ) } )
				: sprintf( '(%(from)s–%(to)s%(unit)s)', {
						from: formatUnit( activeTab, good ),
						to: formatUnit( activeTab, needsImprovement ),
						unit: displayUnit(),
				  } );
		}

		if ( valuation === 'bad' ) {
			return isOverall
				? sprintf( '(0-%(to)s)', { to: formatUnit( activeTab, bad ) } )
				: sprintf( '(Over %(from)s%(unit)s)', {
						from: formatUnit( activeTab, needsImprovement ),
						unit: displayUnit(),
				  } );
		}

		return '';
	};

	const isOverall = activeTab === 'overall_score';

	return (
		<>
			<HStack spacing={ isDesktop ? 5 : 2 } justify="flex-start" wrap>
				<MetricLabel
					indicator="good"
					label={ __( 'Excellent' ) }
					value={ formatThresholdValue( isOverall, 'good' ) }
				/>
				<MetricLabel
					indicator="needsImprovement"
					label={ __( 'Needs Improvement' ) }
					value={ formatThresholdValue( isOverall, 'needsImprovement' ) }
				/>
				<MetricLabel
					indicator="bad"
					label={ __( 'Poor' ) }
					value={ formatThresholdValue( isOverall, 'bad' ) }
				/>
			</HStack>
			{ data ? (
				<LineChart data={ data } withGradientFill={ false } />
			) : (
				<Notice title={ __( 'No history available' ) }>
					{ __(
						'The Chrome User Experience Report collects speed data from real site visits. Sites with low-traffic don‘t provide enough data to generate historical trends.'
					) }
				</Notice>
			) }
		</>
	);
}
