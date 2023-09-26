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
	const domain = useDomainQueryParam();

	const { data, isFetching } = useDomainAnalyzerQuery( domain );
	const { data: hostingProviderData } = useHostingProviderQuery( domain );
	const conversionAction = useDefineConversionAction(
		domain,
		data?.whois,
		data?.is_domain_available,
		hostingProviderData?.hosting_provider
	);

	const updateDomainQueryParam = ( value: string ) => {
		// Update the domain query param;
		// URL param is the source of truth
		queryParams.set( 'domain', value );
		navigate( location.pathname + '?' + queryParams.toString() );
	};

	return (
		<>
			{ ! data && (
				<LayoutBlock className="domain-analyzer-block" width="medium">
					<DocumentHead title={ translate( 'Site Profiler' ) } />
					<DomainAnalyzer
						domain={ domain }
						onFormSubmit={ updateDomainQueryParam }
						isBusy={ isFetching }
					/>
				</LayoutBlock>
			) }

			{ data && (
				<LayoutBlock className="domain-result-block">
					{
						// Translators: %s is the domain name searched
						<DocumentHead title={ translate( '%s ‹ Site Profiler', { args: [ domain ] } ) } />
					}
					{ data && (
						<LayoutBlockSection>
							<HeadingInformation
								domain={ domain }
								conversionAction={ conversionAction }
								onCheckAnotherSite={ () => updateDomainQueryParam( '' ) }
							/>
						</LayoutBlockSection>
					) }
					{ ! data.is_domain_available && (
						<>
							{ data && (
								<LayoutBlockSection>
									<HostingInformation
										dns={ data.dns }
										hostingProvider={ hostingProviderData?.hosting_provider }
									/>
								</LayoutBlockSection>
							) }
							{ data?.whois && (
								<LayoutBlockSection>
									<DomainInformation domain={ domain } whois={ data.whois } />
								</LayoutBlockSection>
							) }
						</>
					) }
				</LayoutBlock>
			) }

			<LayoutBlock isMonoBg>
				<HostingIntro />
			</LayoutBlock>
		</>
	);
}
