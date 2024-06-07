import { isEnabled } from '@automattic/calypso-config';
import page from '@automattic/calypso-router';
import debugFactory from 'debug';
import { translate } from 'i18n-calypso';
import { useState, useRef } from 'react';
import DocumentHead from 'calypso/components/data/document-head';
import { useAnalyzeUrlQuery } from 'calypso/data/site-profiler/use-analyze-url-query';
import { useDomainAnalyzerQuery } from 'calypso/data/site-profiler/use-domain-analyzer-query';
import { useHostingProviderQuery } from 'calypso/data/site-profiler/use-hosting-provider-query';
import { useUrlBasicMetricsQuery } from 'calypso/data/site-profiler/use-url-basic-metrics-query';
import { LayoutBlock, LayoutBlockSection } from 'calypso/site-profiler/components/layout';
import useDefineConversionAction from 'calypso/site-profiler/hooks/use-define-conversion-action';
import useDomainParam from 'calypso/site-profiler/hooks/use-domain-param';
import useLongFetchingDetection from '../hooks/use-long-fetching-detection';
import useScrollToTop from '../hooks/use-scroll-to-top';
import useSiteProfilerRecordAnalytics from '../hooks/use-site-profiler-record-analytics';
import { getValidUrl } from '../utils/get-valid-url';
import { normalizeWhoisField } from '../utils/normalize-whois-entry';
import { AdvancedMetrics } from './advanced-metrics';
import DomainAnalyzer from './domain-analyzer';
import DomainInformation from './domain-information';
import { GetReportForm } from './get-report-form';
import HeadingInformation from './heading-information';
import HostingInformation from './hosting-information';
import HostingIntro from './hosting-intro';
import { MetricsMenu } from './metrics-menu';
import './styles.scss';

const debug = debugFactory( 'apps:site-profiler' );

interface Props {
	routerDomain?: string;
	hash?: string;
	routerOrigin?: string;
}

export default function SiteProfiler( props: Props ) {
	const { routerDomain } = props;
	const basicMetricsRef = useRef( null );
	const performanceMetricsRef = useRef( null );
	const healthScoresRef = useRef( null );
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
		<>
			{ ! showResultScreen && (
				<LayoutBlock className="domain-analyzer-block" width="medium">
					<DocumentHead title={ translate( 'Site Profiler' ) } />
					<DomainAnalyzer
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
				<LayoutBlock className="domain-result-block">
					{
						// Translators: %s is the domain name searched
						<DocumentHead title={ translate( '%s ‹ Site Profiler', { args: [ domain ] } ) } />
					}
					<LayoutBlockSection>
						<HeadingInformation
							domain={ domain }
							conversionAction={ conversionAction }
							onCheckAnotherSite={ () => updateDomainRouteParam( '' ) }
							hostingProvider={ hostingProviderData?.hosting_provider }
							urlData={ urlData }
							domainCategory={ domainCategory }
						/>
					</LayoutBlockSection>
					{ siteProfilerData && ! siteProfilerData.is_domain_available && (
						<>
							<LayoutBlockSection>
								<HostingInformation
									dns={ siteProfilerData.dns }
									urlData={ urlData }
									hostingProvider={ hostingProviderData?.hosting_provider }
								/>
							</LayoutBlockSection>
							<LayoutBlockSection>
								<DomainInformation
									domain={ domain }
									whois={ siteProfilerData.whois }
									hostingProvider={ hostingProviderData?.hosting_provider }
									urlData={ urlData }
								/>
							</LayoutBlockSection>
						</>
					) }
					{ showBasicMetrics && (
						<LayoutBlockSection>
							<MetricsMenu
								basicMetricsRef={ basicMetricsRef }
								performanceMetricsRef={ performanceMetricsRef }
								healthScoresRef={ healthScoresRef }
								onCTAClick={ () => setIsGetReportFormOpen( true ) }
							/>
							<AdvancedMetrics
								performanceMetricsRef={ performanceMetricsRef }
								healthScoresRef={ healthScoresRef }
							/>
						</LayoutBlockSection>
					) }
				</LayoutBlock>
			) }
			<GetReportForm
				url={ basicMetrics?.final_url }
				token={ basicMetrics?.token }
				isOpen={ showGetReportForm }
				onClose={ () => setIsGetReportFormOpen( false ) }
			/>
			<LayoutBlock
				className="hosting-intro-block globe-bg"
				isMonoBg={ showResultScreen && conversionAction && conversionAction !== 'register-domain' }
			>
				<HostingIntro />
			</LayoutBlock>
		</>
	);
}
