import { useState } from 'react';
import { useDomainAnalyzerQuery } from 'calypso/data/site-profiler/use-domain-analyzer-query';
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

	const onFormSubmit = ( domain: string ) => {
		setDomain( domain );
	};

	return (
		<>
			{ ! data && (
				<LayoutBlock>
					<DomainAnalyzer onFormSubmit={ onFormSubmit } isBusy={ isFetching } />
				</LayoutBlock>
			) }

			<LayoutBlock>
				<LayoutBlockSection>
					<HeadingInformation />
				</LayoutBlockSection>
				<LayoutBlockSection>
					<HostingInformation />
				</LayoutBlockSection>
				<LayoutBlockSection>
					<DomainInformation />
				</LayoutBlockSection>
			</LayoutBlock>

			<LayoutBlock isMonoBg>
				<HostingInto />
			</LayoutBlock>
		</>
	);
}
