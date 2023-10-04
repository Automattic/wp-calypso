import { translate } from 'i18n-calypso';
import { useNavigate } from 'react-router-dom';
import DocumentHead from 'calypso/components/data/document-head';
import { useAnalyzeUrlQuery } from 'calypso/data/site-profiler/use-analyze-url-query';
import { useDomainAnalyzerQuery } from 'calypso/data/site-profiler/use-domain-analyzer-query';
import { useHostingProviderQuery } from 'calypso/data/site-profiler/use-hosting-provider-query';
import { LayoutBlock, LayoutBlockSection } from 'calypso/site-profiler/components/layout';
import useDefineConversionAction from 'calypso/site-profiler/hooks/use-define-conversion-action';
import useDomainQueryParam from 'calypso/site-profiler/hooks/use-domain-query-param';
import useLongFetchingDetection from '../hooks/use-long-fetching-detection';
import useSiteProfilerRecordAnalytics from '../hooks/use-site-profiler-record-analytics';
import DomainAnalyzer from './domain-analyzer';
import DomainInformation from './domain-information';
import HeadingInformation from './heading-information';
import HostingInformation from './hosting-information';
import HostingIntro from './hosting-intro';
import './styles.scss';

export default function SiteProfiler() {
	const navigate = useNavigate();
	const {
		domain,
		isValid: isDomainValid,
		specialDomainMapping,
		isDomainSpecialInput,
	} = useDomainQueryParam();

	const {
		data: siteProfilerData,
		error: errorSP,
		isFetching: isFetchingSP,
	} = useDomainAnalyzerQuery( domain, isDomainValid );
	const { data: urlData } = useAnalyzeUrlQuery( domain, isDomainValid );
	const { data: hostingProviderData } = useHostingProviderQuery( domain, isDomainValid );
	const isBusyForWhile = useLongFetchingDetection( domain, isFetchingSP );
	const isWordPressPlatForm = urlData?.platform === 'wordpress';
	const conversionAction = useDefineConversionAction(
		domain,
		siteProfilerData?.whois,
		siteProfilerData?.is_domain_available,
		siteProfilerData?.eligible_google_transfer,
		hostingProviderData?.hosting_provider,
		isWordPressPlatForm
	);
	useSiteProfilerRecordAnalytics(
		domain,
		isDomainValid,
		conversionAction,
		specialDomainMapping,
		hostingProviderData?.hosting_provider,
		urlData
	);

	const updateDomainQueryParam = ( value: string ) => {
		// Update the domain query param;
		// URL param is the source of truth
		if ( ! value ) {
			navigate( '/site-profiler' );
			return;
		}
		navigate( '/site-profiler/' + value );
	};
	const noNeedToFetchApi = specialDomainMapping && isDomainSpecialInput;
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
						onFormSubmit={ updateDomainQueryParam }
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
									onCheckAnotherSite={ () => updateDomainQueryParam( '' ) }
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
