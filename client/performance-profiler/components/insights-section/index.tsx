import { useTranslate } from 'i18n-calypso';
import { PerformanceMetricsItemQueryResponse } from 'calypso/data/site-profiler/types';
import { MetricsInsight } from 'calypso/performance-profiler/components/metrics-insight';
import './style.scss';

type InsightsSectionProps = {
	audits: Record< string, PerformanceMetricsItemQueryResponse >;
};

export const InsightsSection = ( props: InsightsSectionProps ) => {
	const translate = useTranslate();
	const { audits } = props;

	return (
		<div className="performance-profiler-insights-section">
			<h2 className="title">{ translate( "Improve your site's performance" ) }</h2>
			<p className="subtitle">
				{ translate( 'We found things you can do to speed up your site.' ) }
			</p>
			{ Object.values( audits ).map( ( audit, index ) => (
				<MetricsInsight key={ `insight-${ index }` } insight={ audit } index={ index } />
			) ) }
		</div>
	);
};
