import { useTranslate } from 'i18n-calypso';
import { MetricsInsight } from 'calypso/site-profiler/components/metrics-insight';
import { MetricsSection } from 'calypso/site-profiler/components/metrics-section';
import { getTitleTranslateOptions } from 'calypso/site-profiler/utils/get-title-translate-options';

interface PerformanceSectionProps {
	performanceMetricsRef: React.RefObject< HTMLObjectElement >;
	setIsGetReportFormOpen?: ( isOpen: boolean ) => void;
}

export const PerformanceSection: React.FC< PerformanceSectionProps > = ( props ) => {
	const translate = useTranslate();
	const { performanceMetricsRef, setIsGetReportFormOpen } = props;

	return (
		<MetricsSection
			name={ translate( 'Performance Metrics' ) }
			title={ translate(
				"Your site {{good}}performs well{{/good}}, but there's always room to be faster and smoother for your visitors.",
				getTitleTranslateOptions()
			) }
			subtitle={ translate( "Boost your site's performance" ) }
			ref={ performanceMetricsRef }
		>
			{ Array( 2 )
				.fill( {
					header:
						'Your site reveals first content slower than 76% of peers, affecting first impressions.',
					description: 'This is how you can improve it',
				} )
				.map( ( insight, index ) => (
					<MetricsInsight key={ `insight-${ index }` } insight={ insight } />
				) ) }

			{ Array( 5 )
				.fill( {} )
				.map( ( _, index ) => (
					<MetricsInsight
						key={ `locked-${ index }` }
						locked
						onClick={ () => setIsGetReportFormOpen?.( true ) }
					/>
				) ) }
		</MetricsSection>
	);
};

export default PerformanceSection;
