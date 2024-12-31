import DomainsTableSslCell from '@automattic/domains-table/src/domains-table/domains-table-ssl-cell';
import { domainManagementLink as getDomainManagementLink } from '@automattic/domains-table/src/utils/paths';
import { DomainData } from '../types';

interface Props {
	domain: DomainData;
}

const SslStatusField = ( { domain }: Props ) => {
	const domainManagementLink = ! domain.processed.isWPCOMDomain
		? getDomainManagementLink( domain.processed, domain.original.site_slug, true )
		: '';

	const hasWpcomManagedSslCert = domain.processed.type === 'wpcom';

	return (
		<DomainsTableSslCell
			domainManagementLink={ domainManagementLink }
			sslStatus={ domain.processed.sslStatus }
			hasWpcomManagedSslCert={ hasWpcomManagedSslCert }
			as="div"
		/>
	);
};

export { SslStatusField };
