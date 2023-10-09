import { translate } from 'i18n-calypso';
import page from 'page';
import DocumentHead from 'calypso/components/data/document-head';
import { useAnalyzeUrlQuery } from 'calypso/data/site-profiler/use-analyze-url-query';
import { useDomainAnalyzerQuery } from 'calypso/data/site-profiler/use-domain-analyzer-query';
import { useHostingProviderQuery } from 'calypso/data/site-profiler/use-hosting-provider-query';
import { LayoutBlock, LayoutBlockSection } from 'calypso/site-profiler/components/layout';
import useDefineConversionAction from 'calypso/site-profiler/hooks/use-define-conversion-action';
import useDomainParam from 'calypso/site-profiler/hooks/use-domain-param';
import useLongFetchingDetection from '../hooks/use-long-fetching-detection';
import useScrollToTop from '../hooks/use-scroll-to-top';
import useSiteProfilerRecordAnalytics from '../hooks/use-site-profiler-record-analytics';
import DomainAnalyzer from './domain-analyzer';
import DomainInformation from './domain-information';
import HeadingInformation from './heading-information';
import HostingInformation from './hosting-information';
import HostingIntro from './hosting-intro';
import './styles.scss';

interface Props {
	routerDomain?: string;
}

export default function SiteProfiler( props: Props ) {
	const { routerDomain } = props;
	const {
		domain,
		isValid: isDomainValid,
		specialDomainMapping,
		isSpecial,
	} = useDomainParam( routerDomain );

	const {
		data: siteProfilerData,
		error: errorSP,
		isFetching: isFetchingSP,
	} = useDomainAnalyzerQuery( domain, isDomainValid );
	const { data: urlData, isError: isErrorUrlData } = useAnalyzeUrlQuery( domain, isDomainValid );
	const { data: hostingProviderData } = useHostingProviderQuery( domain, isDomainValid );
	const isBusyForWhile = useLongFetchingDetection( domain, isFetchingSP );
	const conversionAction = useDefineConversionAction(
		domain,
		siteProfilerData,
		hostingProviderData,
		isErrorUrlData ? null : urlData
	);

	useScrollToTop( !! siteProfilerData );
	useSiteProfilerRecordAnalytics(
		domain,
		isDomainValid,
		conversionAction,
		specialDomainMapping,
		hostingProviderData?.hosting_provider,
		urlData
	);

	const updateDomainRouteParam = ( value: string ) => {
		// Update the domain param;
		// URL param is the source of truth
		value ? page( `/site-profiler/${ value }` ) : page( '/site-profiler' );
	};
	const noNeedToFetchApi = specialDomainMapping && isSpecial;
	const showResultScreen = siteProfilerData || noNeedToFetchApi;

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

			{
				// For special valid domain mapping, we need to wait until the result comes back
				showResultScreen && (
					<LayoutBlock className="domain-result-block">
						{
							// Translators: %s is the domain name searched
							<DocumentHead title={ translate( '%s ‹ Site Profiler', { args: [ domain ] } ) } />
						}
						{ ( siteProfilerData || specialDomainMapping ) && (
							<LayoutBlockSection>
								<HeadingInformation
									domain={ domain }
									conversionAction={ conversionAction }
									onCheckAnotherSite={ () => updateDomainRouteParam( '' ) }
									hostingProvider={ hostingProviderData?.hosting_provider }
									urlData={ urlData }
									specialDomainMapping={ specialDomainMapping }
								/>
							</LayoutBlockSection>
						) }
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
					</LayoutBlock>
				)
			}

			<LayoutBlock
				className="hosting-intro-block globe-bg"
				isMonoBg={
					!! showResultScreen && conversionAction !== 'register-domain' && ! noNeedToFetchApi
				}
			>
				<HostingIntro />
			</LayoutBlock>
		</>
	);
}
