import { useTranslate } from 'i18n-calypso';
import { MetricsInsightsList } from 'calypso/site-profiler/components/metrics-insights-list';
import { MetricsSection } from 'calypso/site-profiler/components/metrics-section';

interface PerformanceSectionProps {
	performanceMetricsRef: React.RefObject< HTMLObjectElement >;
}

export const PerformanceSection: React.FC< PerformanceSectionProps > = ( props ) => {
	const translate = useTranslate();
	const { performanceMetricsRef } = props;

	return (
		<MetricsSection
			name={ translate( 'Performance Metrics' ) }
			title={ translate(
				"Your site {{success}}performs well{{/success}}, but there's always room to be faster and smoother for your visitors.",
				{
					components: {
						success: <span className="success" />,
						alert: <span className="alert" />,
					},
				}
			) }
			subtitle={ translate( "Boost your site's performance" ) }
			ref={ performanceMetricsRef }
		>
			<MetricsInsightsList
				insights={ Array( 10 ).fill( {
					header:
						'Your site reveals first content slower than 76% of peers, affecting first impressions.',
					description: 'This is how you can improve it',
				} ) }
			/>
		</MetricsSection>
	);
};

export default PerformanceSection;
