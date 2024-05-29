import { useTranslate } from 'i18n-calypso';
import { useUrlPerformanceMetricsQuery } from 'calypso/data/site-profiler/use-url-performance-metrics-query';
import { MetricsInsight } from 'calypso/site-profiler/components/metrics-insight';
import { MetricsSection } from 'calypso/site-profiler/components/metrics-section';
import { getTitleTranslateOptions } from 'calypso/site-profiler/utils/get-title-translate-options';
import { InsightHeader } from '../metrics-insight/insight-header';

interface PerformanceSectionProps {
	url?: string;
	hash?: string;
	performanceMetricsRef: React.RefObject< HTMLObjectElement >;
	setIsGetReportFormOpen?: ( isOpen: boolean ) => void;
}

export const PerformanceSection: React.FC< PerformanceSectionProps > = ( props ) => {
	const translate = useTranslate();
	const { url, hash, performanceMetricsRef, setIsGetReportFormOpen } = props;
	const { data } = useUrlPerformanceMetricsQuery( url, hash );
	const performanceData = data?.performance?.diagnostic ?? {};

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
			{ Object.values( performanceData ).map( ( metric ) => (
				<MetricsInsight
					key={ `insight-${ metric.id }` }
					insight={ {
						header: <InsightHeader data={ metric } />,
						description: 'This is how you can improve it',
					} }
				/>
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
