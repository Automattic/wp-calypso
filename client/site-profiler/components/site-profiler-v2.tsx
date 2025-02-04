import page from '@automattic/calypso-router';
import clsx from 'clsx';
import { translate } from 'i18n-calypso';
import { useEffect, useMemo, useRef, useState } from 'react';
import DocumentHead from 'calypso/components/data/document-head';
import {
	getBasicMetricsFromPerfReport,
	getPerformanceCategory,
} from 'calypso/data/site-profiler/metrics-dictionaries';
import { useAnalyzeUrlQuery } from 'calypso/data/site-profiler/use-analyze-url-query';
import { useDomainAnalyzerQuery } from 'calypso/data/site-profiler/use-domain-analyzer-query';
import { useHostingProviderQuery } from 'calypso/data/site-profiler/use-hosting-provider-query';
import { useUrlBasicMetricsQuery } from 'calypso/data/site-profiler/use-url-basic-metrics-query';
import { useUrlPerformanceMetricsQuery } from 'calypso/data/site-profiler/use-url-performance-metrics-query';
import { useUrlSecurityMetricsQuery } from 'calypso/data/site-profiler/use-url-security-metrics-query';
import { LayoutBlock } from 'calypso/site-profiler/components/layout';
import useDefineConversionAction from 'calypso/site-profiler/hooks/use-define-conversion-action';
import useDomainParam from 'calypso/site-profiler/hooks/use-domain-param';
import useLongFetchingDetection from '../hooks/use-long-fetching-detection';
import useScrollToTop from '../hooks/use-scroll-to-top';
import useSiteProfilerRecordAnalytics from '../hooks/use-site-profiler-record-analytics';
import { getDomainFromUrl, getValidUrl } from '../utils/get-valid-url';
import { normalizeWhoisField } from '../utils/normalize-whois-entry';
import { BasicMetrics } from './basic-metrics';
import { DomainSection } from './domain-section';
import { FootNote } from './footnote';
import { GetReportForm } from './get-report-form';
import { HealthSection } from './health-section';
import { HostingSection } from './hosting-section';
import { LandingPageHeader } from './landing-page-header';
import { LoadingScreen } from './loading-screen';
import { MigrationBannerBig } from './migration-banner-big';
import { NavMenu } from './nav-menu';
import { PerformanceSection } from './performance-section';
import { ResultsHeader } from './results-header';
import { SecuritySection } from './security-section';
import './styles-v2.scss';

interface Props {
	routerDomain?: string;
	hash?: string;
	routerOrigin?: string;
}

export default function SiteProfilerV2( props: Props ) {
	const { routerDomain, hash, routerOrigin } = props;
	const hostingRef = useRef( null );
	const domainRef = useRef( null );
	const perfomanceMetricsRef = useRef( null );
	const healthMetricsRef = useRef( null );
	const securityMetricsRef = useRef( null );
	const [ isGetReportFormOpen, setIsGetReportFormOpen ] = useState( false );

	const {
		domain,
		category: domainCategory,
		isValid: isDomainValid,
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
	const showLandingPage = ! hash;

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

	const url = useMemo( () => getValidUrl( routerDomain ), [ routerDomain ] );

	const { data: basicMetrics } = useUrlBasicMetricsQuery( url, hash, true );

	const showGetReportForm = !! url && isGetReportFormOpen;

	const { data: performanceMetrics } = useUrlPerformanceMetricsQuery( routerDomain, hash );

	const basicMetricsFromPerfReport = useMemo(
		() => getBasicMetricsFromPerfReport( performanceMetrics ),
		[ performanceMetrics ]
	);

	const { final_url: finalUrl, token } = basicMetrics || {};
	const finalUrlDomain = useMemo( () => getDomainFromUrl( finalUrl ), [ finalUrl ] );
	useEffect( () => {
		if ( finalUrlDomain && token ) {
			page( `/site-profiler/report/${ token }/${ finalUrlDomain }/?ref=landingPage` );
		}
	}, [ finalUrlDomain, token ] );

	const { data: securityMetrics } = useUrlSecurityMetricsQuery( url, hash );
	const { errors: securityMetricsErrors = {} } = securityMetrics ?? {};
	const noWordPressFound = Object.keys( securityMetricsErrors ).find(
		( error ) => error === 'no_wordpress'
	);

	const showResultScreen = siteProfilerData && performanceMetrics && securityMetrics;

	const performanceCategory = getPerformanceCategory( performanceMetrics );

	const updateDomainRouteParam = ( value: string ) => {
		// Update the domain param;
		// URL param is the source of truth
		value ? page( `/site-profiler/${ value }` ) : page( '/site-profiler' );
	};

	const { is_wpcom: isWpCom = false, is_wordpress: isWordPress = false } = performanceMetrics ?? {};

	return (
		<div id="site-profiler-v2">
			{ showLandingPage && (
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
			{ ! showLandingPage && ! showResultScreen && (
				<LoadingScreen isSavedReport={ routerOrigin !== 'landingPage' } />
			) }
			{ showResultScreen && (
				<>
					<LayoutBlock
						className={ clsx(
							'results-header-block',
							{ poor: performanceCategory === 'non-wpcom-low-performer' },
							{ good: performanceCategory !== 'non-wpcom-low-performer' }
						) }
						width="medium"
					>
						<ResultsHeader
							domain={ domain }
							performanceCategory={ performanceCategory }
							isWordPress={ isWordPress }
							isWpCom={ isWpCom }
							onGetReport={ () => setIsGetReportFormOpen( true ) }
						/>
					</LayoutBlock>
					<LayoutBlock width="medium">
						{ basicMetricsFromPerfReport && (
							<BasicMetrics
								basicMetrics={ basicMetricsFromPerfReport }
								domain={ domain }
								isWpCom={ isWpCom }
							/>
						) }
						<NavMenu
							domain={ domain }
							navItems={ [
								{ label: translate( 'Hosting' ), ref: hostingRef },
								{ label: translate( 'Domain' ), ref: domainRef },
								{ label: translate( 'Performance Metrics' ), ref: perfomanceMetricsRef },
								{ label: translate( 'Health Scores' ), ref: healthMetricsRef },
								...( noWordPressFound
									? []
									: [ { label: translate( 'Security' ), ref: securityMetricsRef } ] ),
							] }
							showMigrationCta={ ! isWpCom }
						></NavMenu>
						<HostingSection
							url={ url }
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
							hostingProvider={ hostingProviderData?.hosting_provider }
							performanceMetricsRef={ perfomanceMetricsRef }
							setIsGetReportFormOpen={ setIsGetReportFormOpen }
						/>

						<HealthSection
							url={ url }
							hash={ hash ?? basicMetrics?.token }
							hostingProvider={ hostingProviderData?.hosting_provider }
							healthMetricsRef={ healthMetricsRef }
							setIsGetReportFormOpen={ setIsGetReportFormOpen }
						/>

						<SecuritySection
							url={ url }
							hash={ hash ?? basicMetrics?.token }
							hostingProvider={ hostingProviderData?.hosting_provider }
							securityMetricsRef={ securityMetricsRef }
							setIsGetReportFormOpen={ setIsGetReportFormOpen }
						/>
					</LayoutBlock>
					{ ! isWpCom && <MigrationBannerBig url={ basicMetrics?.final_url } /> }
				</>
			) }
			<FootNote />
			<GetReportForm
				url={ url }
				token={ hash }
				isOpen={ showGetReportForm }
				onClose={ () => setIsGetReportFormOpen( false ) }
			/>
		</div>
	);
}
