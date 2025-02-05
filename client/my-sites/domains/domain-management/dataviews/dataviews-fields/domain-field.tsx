import { PartialDomainData } from '@automattic/data-stores';
import { PrimaryDomainLabel } from '@automattic/domains-table';
import { domainInfoContext } from '@automattic/domains-table/src/utils/constants';
import { getDomainTypeText } from '@automattic/domains-table/src/utils/get-domain-type-text';
import { useI18n } from '@wordpress/react-i18n';
import { useDomainsDataViewsContext } from '../use-context';

interface Props {
	domain: PartialDomainData;
	isAllSitesView: boolean;
	selectedFeature?: string;
}

const DomainField = ( { domain: partialDomain, isAllSitesView }: Props ) => {
	const { __ } = useI18n();
	const { getFullDomain } = useDomainsDataViewsContext();
	const domain = getFullDomain( partialDomain );
	const domainTypeText = domain
		? getDomainTypeText( domain, __, domainInfoContext.DOMAIN_ROW )
		: '';
	const showPrimaryDomainLabel = ! isAllSitesView && domain && domain.isPrimary;

	return (
		<>
			{ showPrimaryDomainLabel && <PrimaryDomainLabel /> }
			<div className="domains-dataviews__domain-name">{ partialDomain.domain }</div>

			{ domainTypeText && (
				<div className="domains-table-row__domain-type-text">{ domainTypeText }</div>
			) }
		</>
	);
};

export { DomainField };
