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

interface HealthSectionProps {
	url?: string;
	hash?: string;
	hostingProvider?: HostingProvider;
	healthMetricsRef: React.RefObject< HTMLObjectElement >;
	setIsGetReportFormOpen?: ( isOpen: boolean ) => void;
}

const OVERALL_SCORE_THRESHOLD = 0.8;

export const HealthSection: React.FC< HealthSectionProps > = ( props ) => {
	const translate = useTranslate();
	const { url, hash, hostingProvider, healthMetricsRef, setIsGetReportFormOpen } = props;
	const { data }: { data: any } = useUrlPerformanceMetricsQuery( url, hash );
	const { truncated, diagnostic: healthData = {} } = data?.audits.health ?? {};

	const isWPcom = hostingProvider?.slug?.toLowerCase() === 'automattic';

	const healthScore = data?.overall_score ?? 0;
	const isHealthGood = healthScore >= OVERALL_SCORE_THRESHOLD;

	const title = useMemo( () => {
		if ( ! isHealthGood && ! isWPcom ) {
			return translate(
				"Your site's health scores need attention to prevent {{poor}}low performance{{/poor}}. Improve with WordPress.com's tools for better performance.",
				getTitleTranslateOptions()
			);
		}

		if ( isHealthGood && ! isWPcom ) {
			return translate(
				"Your site's {{good}}health scores are strong{{/good}}, but there's room for improvement. Optimize further with WordPress.com's tools.",
				getTitleTranslateOptions()
			);
		}

		if ( isHealthGood && isWPcom ) {
			return translate(
				"Your site's {{good}}health scores are strong{{/good}}, indicating well-maintained performance and user experience. Keep monitoring and optimizing for the best results.",
				getTitleTranslateOptions()
			);
		}

		return translate(
			"Your site's health scores are decent, but critical areas need attention to prevent {{poor}}low performance{{/poor}} and ensure stability",
			getTitleTranslateOptions()
		);
	}, [ isHealthGood, isWPcom, translate ] );

	return (
		<MetricsSection
			name={ translate( 'Health Scores' ) }
			title={ title }
			subtitle={ ! isWPcom ? translate( 'Boost Site Health Now' ) : null }
			subtitleOnClick={ () =>
				page( `/setup/hosted-site-migration?ref=site-profiler&from=${ url }` )
			}
			ref={ healthMetricsRef }
		>
			{ Object.values( healthData ).map( ( metric: any ) => (
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
