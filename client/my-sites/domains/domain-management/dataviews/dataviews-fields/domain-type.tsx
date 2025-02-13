import { PartialDomainData } from '@automattic/data-stores';
import { domainInfoContext } from '@automattic/domains-table/src/utils/constants';
import { getDomainTypeText } from '@automattic/domains-table/src/utils/get-domain-type-text';
import { useI18n } from '@wordpress/react-i18n';
import { useDomainsDataViewsContext } from '../use-context';

const DomainType = ( { item }: { item: PartialDomainData } ) => {
	const { __ } = useI18n();
	const { getFullDomain } = useDomainsDataViewsContext();
	const domain = getFullDomain( item );
	const domainTypeText = domain
		? getDomainTypeText( domain, __, domainInfoContext.DOMAIN_ROW )
		: '';

	return (
		domainTypeText && <div className="domains-table-row__domain-type-text">{ domainTypeText }</div>
	);
};

export { DomainType };
