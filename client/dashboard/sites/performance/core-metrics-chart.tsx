import { __experimentalHStack as HStack } from '@wordpress/components';
import { useViewportMatch } from '@wordpress/compose';
import { __, sprintf } from '@wordpress/i18n';
import { Text } from '../../components/text';
import { Valuation, getColorForStatus } from '../../utils/site-performance';

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

export default function CoreMetricsChart( {
	activeTab,
	metricsThresholds,
}: {
	data?: any;
	activeTab: string;
	metricsThresholds: any;
} ) {
	const { good, needsImprovement, bad } = metricsThresholds[ activeTab ];
	const isDesktop = useViewportMatch( 'medium' );

	const formatUnit = ( value: number | string ) => {
		const num = parseFloat( value as string );
		if ( [ 'lcp', 'fcp', 'ttfb' ].includes( activeTab ) ) {
			return Number( num / 1000 ).toFixed( 2 );
		}
		return num;
	};

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
				? sprintf( '(50–%(to)s)', { to: formatUnit( needsImprovement ) } )
				: sprintf( '(%(from)s–%(to)s%(unit)s)', {
						from: formatUnit( good ),
						to: formatUnit( needsImprovement ),
						unit: displayUnit(),
				  } );
		}

		if ( valuation === 'needsImprovement' ) {
			return isOverall
				? sprintf( '(50–%(to)s)', { to: formatUnit( needsImprovement ) } )
				: sprintf( '(%(from)s–%(to)s%(unit)s)', {
						from: formatUnit( good ),
						to: formatUnit( needsImprovement ),
						unit: displayUnit(),
				  } );
		}

		if ( valuation === 'bad' ) {
			return isOverall
				? sprintf( '(0-%(to)s)', { to: formatUnit( bad ) } )
				: sprintf( '(Over %(from)s%(unit)s)', {
						from: formatUnit( needsImprovement ),
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
			<Text> Not implemented yet</Text>
		</>
	);
}
