import page from '@automattic/calypso-router';
import classnames from 'classnames';
import debugFactory from 'debug';
import { translate } from 'i18n-calypso';
import { useRef, useState } from 'react';
import DocumentHead from 'calypso/components/data/document-head';
import { getPerformanceCategory } from 'calypso/data/site-profiler/metrics-dictionaries';
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
import { BasicMetrics } from './basic-metrics';
import { DomainSection } from './domain-section';
import { GetReportForm } from './get-report-form';
import { HostingSection } from './hosting-section';
import { LandingPageHeader } from './landing-page-header';
import { MigrationBanner } from './migration-banner';
import { MigrationBannerBig } from './migration-banner-big';
import { PerformanceSection } from './performance-section';
import { ResultsHeader } from './results-header';
import './styles-v2.scss';

const debug = debugFactory( 'apps:site-profiler' );

interface Props {
	routerDomain?: string;
	hash?: string;
}

export default function SiteProfilerV2( props: Props ) {
	const { routerDomain, hash } = props;
	const hostingRef = useRef( null );
	const domainRef = useRef( null );
	const perfomanceMetricsRef = useRef( null );
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

	const showBasicMetrics = basicMetrics && ! isFetchingBasicMetrics && ! errorBasicMetrics;

	// TODO: Remove this debug statement once we have a better error handling mechanism
	if ( errorBasicMetrics ) {
		debug(
			`Error fetching basic metrics for domain ${ domain }: ${ errorBasicMetrics.message }`,
			errorBasicMetrics
		);
	}

	const showGetReportForm = !! showBasicMetrics && !! url && isGetReportFormOpen;

	const performanceCategory = getPerformanceCategory( basicMetrics?.basic, urlData );

	const updateDomainRouteParam = ( value: string ) => {
		// Update the domain param;
		// URL param is the source of truth
		value ? page( `/site-profiler/${ value }` ) : page( '/site-profiler' );
	};

	const isWpCom = !! urlData?.platform_data?.is_wpcom;

	return (
		<div id="site-profiler-v2">
			{ ! showResultScreen && (
				<LayoutBlock className="landing-page-header-block" width="medium">
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
				<>
					<LayoutBlock
						className={ classnames(
							'results-header-block',
							{ poor: performanceCategory === 'non-wpcom-low-performer' },
							{ good: performanceCategory !== 'non-wpcom-low-performer' }
						) }
						width="medium"
					>
						{ showBasicMetrics && (
							<ResultsHeader
								domain={ domain }
								performanceCategory={ performanceCategory }
								urlData={ urlData }
								onGetReport={ () => setIsGetReportFormOpen( true ) }
							/>
						) }
					</LayoutBlock>
					<LayoutBlock width="medium">
						{ siteProfilerData && (
							<>
								{ showBasicMetrics && (
									<BasicMetrics
										basicMetrics={ basicMetrics.basic }
										domain={ domain }
										isWpCom={ isWpCom }
									/>
								) }
								<HostingSection
									domain={ domain }
									dns={ siteProfilerData.dns }
									urlData={ urlData }
									hostingProvider={ hostingProviderData?.hosting_provider }
									hostingRef={ hostingRef }
								/>

								<DomainSection
									domain={ domain }
									whois={ siteProfilerData.whois }
									hostingProvider={ hostingProviderData?.hosting_provider }
									urlData={ urlData }
									domainRef={ domainRef }
								/>

								<PerformanceSection
									url={ url }
									hash={ hash ?? basicMetrics?.token }
									performanceMetricsRef={ perfomanceMetricsRef }
									setIsGetReportFormOpen={ setIsGetReportFormOpen }
								/>
							</>
						) }
					</LayoutBlock>
					<MigrationBannerBig />
				</>
			) }
			{ ! showResultScreen && <MigrationBanner /> }
			<GetReportForm
				url={ basicMetrics?.final_url }
				token={ basicMetrics?.token }
				isOpen={ showGetReportForm }
				onClose={ () => setIsGetReportFormOpen( false ) }
			/>
		</div>
	);
}
