import { translate } from 'i18n-calypso';
import { useNavigate, useLocation } from 'react-router-dom';
import DocumentHead from 'calypso/components/data/document-head';
import { useDomainAnalyzerQuery } from 'calypso/data/site-profiler/use-domain-analyzer-query';
import { useHostingProviderQuery } from 'calypso/data/site-profiler/use-hosting-provider-query';
import { useQuery } from 'calypso/landing/stepper/hooks/use-query';
import { LayoutBlock, LayoutBlockSection } from 'calypso/site-profiler/components/layout';
import useDefineConversionAction from 'calypso/site-profiler/hooks/use-define-conversion-action';
import useDomainQueryParam from 'calypso/site-profiler/hooks/use-domain-query-param';
import DomainAnalyzer from './domain-analyzer';
import DomainInformation from './domain-information';
import HeadingInformation from './heading-information';
import HostingInformation from './hosting-information';
import HostingIntro from './hosting-intro';
import './styles.scss';

export default function SiteProfiler() {
	const location = useLocation();
	const navigate = useNavigate();
	const queryParams = useQuery();
	const { domain, isValid: isDomainValid } = useDomainQueryParam();

	const { data: siteProfilerData, isFetching } = useDomainAnalyzerQuery( domain, isDomainValid );
	const { data: hostingProviderData } = useHostingProviderQuery( domain, isDomainValid );
	const conversionAction = useDefineConversionAction(
		domain,
		siteProfilerData?.whois,
		siteProfilerData?.is_domain_available,
		hostingProviderData?.hosting_provider
	);

	const updateDomainQueryParam = ( value: string ) => {
		// Update the domain query param;
		// URL param is the source of truth
		value ? queryParams.set( 'domain', value ) : queryParams.delete( 'domain' );

		navigate( location.pathname + '?' + queryParams.toString() );
	};

	return (
		<>
			{ ! siteProfilerData && (
				<LayoutBlock className="domain-analyzer-block" width="medium">
					<DocumentHead title={ translate( 'Site Profiler' ) } />
					<DomainAnalyzer
						domain={ domain }
						isDomainValid={ isDomainValid }
						onFormSubmit={ updateDomainQueryParam }
						isBusy={ isFetching }
					/>
				</LayoutBlock>
			) }

			{ siteProfilerData && (
				<LayoutBlock className="domain-result-block">
					{
						// Translators: %s is the domain name searched
						<DocumentHead title={ translate( '%s ‹ Site Profiler', { args: [ domain ] } ) } />
					}
					{ siteProfilerData && (
						<LayoutBlockSection>
							<HeadingInformation
								domain={ domain }
								conversionAction={ conversionAction }
								onCheckAnotherSite={ () => updateDomainQueryParam( '' ) }
							/>
						</LayoutBlockSection>
					) }
					{ ! siteProfilerData.is_domain_available && (
						<>
							{ siteProfilerData && (
								<LayoutBlockSection>
									<HostingInformation
										dns={ siteProfilerData.dns }
										hostingProvider={ hostingProviderData?.hosting_provider }
									/>
								</LayoutBlockSection>
							) }
							{ siteProfilerData?.whois && (
								<LayoutBlockSection>
									<DomainInformation domain={ domain } whois={ siteProfilerData.whois } />
								</LayoutBlockSection>
							) }
						</>
					) }
				</LayoutBlock>
			) }

			<LayoutBlock isMonoBg={ !! siteProfilerData }>
				<HostingIntro />
			</LayoutBlock>
		</>
	);
}
