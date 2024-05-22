import { isEnabled } from '@automattic/calypso-config';
import page from '@automattic/calypso-router';
import debugFactory from 'debug';
import { translate } from 'i18n-calypso';
import { useRef, useState } from 'react';
import DocumentHead from 'calypso/components/data/document-head';
import { useAnalyzeUrlQuery } from 'calypso/data/site-profiler/use-analyze-url-query';
import { useDomainAnalyzerQuery } from 'calypso/data/site-profiler/use-domain-analyzer-query';
import { useHostingProviderQuery } from 'calypso/data/site-profiler/use-hosting-provider-query';
import { useUrlBasicMetricsQuery } from 'calypso/data/site-profiler/use-url-basic-metrics-query';
import { LayoutBlock } from 'calypso/site-profiler/components/layout';
import useDefineConversionAction from 'calypso/site-profiler/hooks/use-define-conversion-action';
import useDomainParam from 'calypso/site-profiler/hooks/use-domain-param';
import useLongFetchingDetection from '../hooks/use-long-fetching-detection';
import useScrollToTop from '../hooks/use-scroll-to-top';
import useSiteProfilerRecordAnalytics from '../hooks/use-site-profiler-record-analytics';
import { getValidUrl } from '../utils/get-valid-url';
import { normalizeWhoisField } from '../utils/normalize-whois-entry';
import DomainInformation from './domain-information';
import { GetReportForm } from './get-report-form';
import HostingInformation from './hosting-information';
import { LandingPageHeader } from './landing-page-header';
import { MetricsSection } from './metrics-section';
import './styles-v2.scss';

const debug = debugFactory( 'apps:site-profiler' );

interface Props {
	routerDomain?: string;
	hash?: string;
}

export default function SiteProfilerV2( props: Props ) {
	const { routerDomain } = props;
	const hostingRef = useRef( null );
	const domainRef = useRef( null );
	const [ isGetReportFormOpen, setIsGetReportFormOpen ] = useState( false );

	const {
		domain,
		category: domainCategory,
		isValid: isDomainValid,
		isSpecial: isDomainSpecial,
		readyForDataFetch,
	} = useDomainParam( routerDomain );

	const {
		data: siteProfilerData,
		error: errorSP,
		isFetching: isFetchingSP,
	} = useDomainAnalyzerQuery( domain, readyForDataFetch );
	const { data: urlData, isError: isErrorUrlData } = useAnalyzeUrlQuery(
		domain,
		readyForDataFetch
	);
	const { data: hostingProviderData } = useHostingProviderQuery( domain, readyForDataFetch );
	const isBusyForWhile = useLongFetchingDetection( domain, isFetchingSP );
	const conversionAction = useDefineConversionAction(
		domain,
		siteProfilerData,
		hostingProviderData,
		isErrorUrlData ? null : urlData
	);
	const showResultScreen = siteProfilerData || isDomainSpecial;

	useScrollToTop( !! siteProfilerData );
	useSiteProfilerRecordAnalytics(
		domain,
		domainCategory,
		isDomainValid,
		conversionAction,
		hostingProviderData?.hosting_provider,
		normalizeWhoisField( siteProfilerData?.whois?.registrar ),
		urlData
	);

	const url = getValidUrl( routerDomain );

	const {
		data: basicMetrics,
		error: errorBasicMetrics,
		isFetching: isFetchingBasicMetrics,
	} = useUrlBasicMetricsQuery( url );

	const showBasicMetrics =
		basicMetrics &&
		! isFetchingBasicMetrics &&
		! errorBasicMetrics &&
		isEnabled( 'site-profiler/metrics' );

	// TODO: Remove this debug statement once we have a better error handling mechanism
	if ( isEnabled( 'site-profiler/metrics' ) && errorBasicMetrics ) {
		debug(
			`Error fetching basic metrics for domain ${ domain }: ${ errorBasicMetrics.message }`,
			errorBasicMetrics
		);
	}

	let showGetReportForm = false;

	if ( isEnabled( 'site-profiler/metrics' ) ) {
		showGetReportForm = !! showBasicMetrics && !! url && isGetReportFormOpen;
	}

	const updateDomainRouteParam = ( value: string ) => {
		// Update the domain param;
		// URL param is the source of truth
		value ? page( `/site-profiler/${ value }` ) : page( '/site-profiler' );
	};

	return (
		<div id="site-profiler-v2">
			{ ! showResultScreen && (
				<LayoutBlock className="domain-analyzer-block" width="medium">
					<DocumentHead title={ translate( 'Site Profiler' ) } />
					<LandingPageHeader
						domain={ domain }
						isDomainValid={ isDomainValid }
						isBusy={ isFetchingSP }
						isBusyForWhile={ isBusyForWhile }
						domainFetchingError={ errorSP instanceof Error ? errorSP : undefined }
						onFormSubmit={ updateDomainRouteParam }
					/>
				</LayoutBlock>
			) }
			{ showResultScreen && (
				<LayoutBlock width="medium">
					{ siteProfilerData && (
						<>
							<MetricsSection
								name={ translate( 'Hosting' ) }
								title={ translate(
									'Struggles with hosting {{alert}}speed and uptime{{/alert}} deter visitors. A switch to WordPress.com could transform the user experience.',
									{
										components: {
											alert: <span className="alert" />,
										},
									}
								) }
								subtitle={ translate( 'Upgrade your hosting with WordPress.com' ) }
								ref={ hostingRef }
							>
								<HostingInformation
									dns={ siteProfilerData.dns }
									urlData={ urlData }
									hostingProvider={ hostingProviderData?.hosting_provider }
									hideTitle
								/>
							</MetricsSection>
							<MetricsSection
								name={ translate( 'Domain' ) }
								title={ translate(
									'Your domain {{success}}set up is good{{/success}}, but you could boost your site’s visibility and growth.',
									{
										components: {
											success: <span className="success" />,
										},
									}
								) }
								subtitle={ translate( 'Optimize your domain' ) }
								ref={ domainRef }
							>
								<DomainInformation
									domain={ domain }
									whois={ siteProfilerData.whois }
									hostingProvider={ hostingProviderData?.hosting_provider }
									urlData={ urlData }
									hideTitle
								/>
							</MetricsSection>
						</>
					) }
				</LayoutBlock>
			) }

			<GetReportForm
				url={ basicMetrics?.final_url }
				token={ basicMetrics?.token }
				isOpen={ showGetReportForm }
				onClose={ () => setIsGetReportFormOpen( false ) }
			/>
		</div>
	);
}
