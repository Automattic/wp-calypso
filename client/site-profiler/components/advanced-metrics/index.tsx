import { useTranslate } from 'i18n-calypso';
import { MetricsInsightsList } from 'calypso/site-profiler/components/metrics-insights-list';
import { MetricsSection } from 'calypso/site-profiler/components/metrics-section';

interface AdvancedMetricsProps {
	performanceMetricsRef?: React.RefObject< HTMLObjectElement >;
	healthScoresRef?: React.RefObject< HTMLObjectElement >;
}

export const AdvancedMetrics: React.FC< AdvancedMetricsProps > = ( props ) => {
	const translate = useTranslate();
	const { performanceMetricsRef, healthScoresRef } = props;

	return (
		<>
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
			<MetricsSection
				name={ translate( 'Health Scores' ) }
				title={ translate(
					"Your site's health scores {{alert}}suggest critical area{{/alert}} but need attention to prevent low performance.",
					{
						components: {
							success: <span className="success" />,
							alert: <span className="alert" />,
						},
					}
				) }
				subtitle={ translate( "Optimize your site's health" ) }
				ref={ healthScoresRef }
			>
				<MetricsInsightsList locked />
			</MetricsSection>
		</>
	);
};
