import { useState } from 'react';
import { useDomainAnalyzerQuery } from 'calypso/data/site-profiler/use-domain-analyzer-query';
import { useHostingProviderQuery } from 'calypso/data/site-profiler/use-hosting-provider-query';
import { getFixedDomainSearch, extractDomainFromInput } from 'calypso/lib/domains';
import HostingInto from 'calypso/site-profiler/components/hosting-into';
import { LayoutBlock, LayoutBlockSection } from 'calypso/site-profiler/components/layout';
import DomainAnalyzer from './domain-analyzer';
import DomainInformation from './domain-information';
import HeadingInformation from './heading-information';
import HostingInformation from './hosting-information';
import './styles.scss';

export default function SiteProfiler() {
	const [ domain, setDomain ] = useState( '' );
	const { data, isFetching } = useDomainAnalyzerQuery( domain );
	const { data: hostingProviderData } = useHostingProviderQuery( domain );

	const onFormSubmit = ( domain: string ) => {
		setDomain( getFixedDomainSearch( extractDomainFromInput( domain ) ) );
	};

	return (
		<>
			{ ! data && (
				<LayoutBlock>
					<DomainAnalyzer onFormSubmit={ onFormSubmit } isBusy={ isFetching } />
				</LayoutBlock>
			) }

			{ data && (
				<LayoutBlock>
					{ data && (
						<LayoutBlockSection>
							<HeadingInformation domain={ domain } onCheckAnotherSite={ () => setDomain( '' ) } />
						</LayoutBlockSection>
					) }
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
				</LayoutBlock>
			) }

			<LayoutBlock isMonoBg>
				<HostingInto />
			</LayoutBlock>
		</>
	);
}
