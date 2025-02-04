import page from '@automattic/calypso-router';
import { useTranslate } from 'i18n-calypso';
import { useMemo } from 'react';
import { HostingProvider } from 'calypso/data/site-profiler/types';
import { useUrlSecurityMetricsQuery } from 'calypso/data/site-profiler/use-url-security-metrics-query';
import { MetricsInsight } from 'calypso/site-profiler/components/metrics-insight';
import { InsightContent } from 'calypso/site-profiler/components/metrics-insight/insight-content';
import { InsightHeader } from 'calypso/site-profiler/components/metrics-insight/insight-header';
import { MetricsSection } from 'calypso/site-profiler/components/metrics-section';
import { getTitleTranslateOptions } from 'calypso/site-profiler/utils/get-title-translate-options';

interface SecuritySectionProps {
	url?: string;
	hash?: string;
	hostingProvider?: HostingProvider;
	securityMetricsRef: React.RefObject< HTMLObjectElement >;
	setIsGetReportFormOpen?: ( isOpen: boolean ) => void;
}

export const SecuritySection: React.FC< SecuritySectionProps > = ( props ) => {
	const translate = useTranslate();
	const { url, hash, hostingProvider, securityMetricsRef, setIsGetReportFormOpen } = props;
	const { data }: { data: any } = useUrlSecurityMetricsQuery( url, hash );
	const { truncated, fail: securityData = {} } = data?.report?.audits ?? {};
	const overallVulnerabilities = data?.report?.ovc ?? 0;

	const { errors = {} } = data ?? {};
	const noWordPressFound = Object.keys( errors ).find( ( error ) => error === 'no_wordpress' );

	const isWPcom = hostingProvider?.slug?.toLowerCase() === 'automattic';

	const isSecurityGood = overallVulnerabilities === 0;

	const title = useMemo( () => {
		if ( ! isSecurityGood && ! isWPcom ) {
			return translate(
				'Security vulnerabilities are {{poor}}exposing your site to risks{{/poor}}. Migrate to WordPress.com for robust security measures.',
				getTitleTranslateOptions()
			);
		}

		if ( isSecurityGood && ! isWPcom ) {
			return translate(
				'Your site is well-secured, but enhancing it further will {{good}}protect your data more effectively{{/good}}. Continue improving security for optimal protection.',
				getTitleTranslateOptions()
			);
		}

		if ( isSecurityGood && isWPcom ) {
			return translate(
				'Your site is well-secured, effectively {{good}}protecting against risks{{/good}} and maintaining its integrity. Continue to enhance security measures for optimal protection.',
				getTitleTranslateOptions()
			);
		}

		return translate(
			'Your site has some {{poor}}security vulnerabilities{{/poor}} that could expose it to risks. Strengthen your site further with our advanced protection.',
			getTitleTranslateOptions()
		);
	}, [ isSecurityGood, isWPcom, translate ] );

	if ( noWordPressFound ) {
		return;
	}

	return (
		<MetricsSection
			name={ translate( 'Security' ) }
			title={ title }
			subtitle={ ! isWPcom ? translate( 'Migrate for Better Security' ) : null }
			subtitleOnClick={ () =>
				page( `/setup/hosted-site-migration?ref=site-profiler&from=${ url }` )
			}
			ref={ securityMetricsRef }
		>
			{ Object.values( securityData ).map( ( metric: any ) => (
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
