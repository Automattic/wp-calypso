import page from '@automattic/calypso-router';
import { useTranslate } from 'i18n-calypso';
import { useMemo } from 'react';
import { HostingProvider } from 'calypso/data/site-profiler/types';
import { useUrlPerformanceMetricsQuery } from 'calypso/data/site-profiler/use-url-performance-metrics-query';
import { MetricsInsight } from 'calypso/site-profiler/components/metrics-insight';
import { InsightContent } from 'calypso/site-profiler/components/metrics-insight/insight-content';
import { InsightHeader } from 'calypso/site-profiler/components/metrics-insight/insight-header';
import { MetricsSection } from 'calypso/site-profiler/components/metrics-section';
import { getTitleTranslateOptions } from 'calypso/site-profiler/utils/get-title-translate-options';

interface PerformanceSectionProps {
	url?: string;
	hash?: string;
	hostingProvider?: HostingProvider;
	performanceMetricsRef: React.RefObject< HTMLObjectElement >;
	setIsGetReportFormOpen?: ( isOpen: boolean ) => void;
}

const PERFORMANCE_THRESHOLD = 0.9;

export const PerformanceSection: React.FC< PerformanceSectionProps > = ( props ) => {
	const translate = useTranslate();
	const { url, hash, hostingProvider, performanceMetricsRef, setIsGetReportFormOpen } = props;
	const { data }: { data: any } = useUrlPerformanceMetricsQuery( url, hash );
	const { truncated, diagnostic: performanceData = {} } = data?.audits.performance ?? {};

	const isWPcom = hostingProvider?.slug?.toLowerCase() === 'automattic';

	const performanceScore = data?.performance ?? 0;
	const isPerformanceGood = performanceScore >= PERFORMANCE_THRESHOLD;

	const title = useMemo( () => {
		if ( ! isPerformanceGood && ! isWPcom ) {
			return translate(
				"Your site's performance could be better. Migrate to WordPress.com for significant improvements in {{poor}}speed and reliability.{{/poor}}",
				getTitleTranslateOptions()
			);
		}

		if ( isPerformanceGood && ! isWPcom ) {
			return translate(
				"Your site {{good}}performs well{{/good}}, but there's room for improvement. Migrate to WordPress.com for even better performance.",
				getTitleTranslateOptions()
			);
		}

		if ( isPerformanceGood && isWPcom ) {
			return translate(
				"Your site's {{good}}performance is outstanding{{/good}}. Keep up the great work and explore advanced features to stay ahead.",
				getTitleTranslateOptions()
			);
		}

		return translate(
			'Your site performs well, but there are {{poor}}areas for improvement{{/poor}}.',
			getTitleTranslateOptions()
		);
	}, [ isPerformanceGood, isWPcom, translate ] );

	return (
		<MetricsSection
			name={ translate( 'Performance Metrics' ) }
			title={ title }
			subtitle={ ! isWPcom ? translate( "Boost your site's performance" ) : null }
			subtitleOnClick={ () =>
				page( `/setup/hosted-site-migration?ref=site-profiler&from=${ url }` )
			}
			ref={ performanceMetricsRef }
		>
			{ Object.values( performanceData ).map( ( metric: any ) => (
				<MetricsInsight
					key={ `insight-${ metric.id }` }
					insight={ {
						header: <InsightHeader data={ metric } />,
						description: <InsightContent data={ metric } />,
					} }
				/>
			) ) }

			{ truncated &&
				Array( 10 )
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
