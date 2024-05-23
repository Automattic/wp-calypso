import { useTranslate } from 'i18n-calypso';
import { MetricsSection } from 'calypso/site-profiler/components/metrics-section';
import { MetricsInsight } from '../metrics-insight';

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
