import { LoadingPlaceholder } from '@automattic/components';
import { PartialDomainData } from '@automattic/data-stores';
import DomainsTableSslCell from '@automattic/domains-table/src/domains-table/domains-table-ssl-cell';
import { domainManagementLink as getDomainManagementLink } from '@automattic/domains-table/src/utils/paths';
import { useDomainsDataViewsContext } from '../use-context';

interface Props {
	domain: PartialDomainData;
}

const SslStatusField = ( props: Props ) => {
	const { getFullDomain, getSiteSlug, isLoadingSites } = useDomainsDataViewsContext();
	const domain = getFullDomain( props.domain );

	if ( ! domain || isLoadingSites ) {
		return <LoadingPlaceholder />;
	}

	const siteSlug = getSiteSlug( props.domain );

	const domainManagementLink = ! domain.isWPCOMDomain
		? getDomainManagementLink( domain, siteSlug, true )
		: '';

	const hasWpcomManagedSslCert = domain.type === 'wpcom';

	return (
		<DomainsTableSslCell
			domainManagementLink={ domainManagementLink }
			sslStatus={ domain.sslStatus }
			hasWpcomManagedSslCert={ hasWpcomManagedSslCert }
			as="div"
		/>
	);
};

export { SslStatusField };
