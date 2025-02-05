import { PartialDomainData } from '@automattic/data-stores';
import { PrimaryDomainLabel } from '@automattic/domains-table';
import { useDomainsDataViewsContext } from '../use-context';

interface Props {
	domain: PartialDomainData;
	isAllSitesView: boolean;
	selectedFeature?: string;
}

const DomainField = ( { domain: partialDomain, isAllSitesView }: Props ) => {
	const { getFullDomain } = useDomainsDataViewsContext();
	const domain = getFullDomain( partialDomain );
	const showPrimaryDomainLabel = ! isAllSitesView && domain && domain.isPrimary;

	return (
		<>
			{ showPrimaryDomainLabel && <PrimaryDomainLabel /> }
			<div className="domains-dataviews__domain-name">{ partialDomain.domain }</div>
		</>
	);
};

export { DomainField };
