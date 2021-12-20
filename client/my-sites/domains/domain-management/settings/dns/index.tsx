/* eslint-disable wpcalypso/jsx-classname-namespace */

import QueryDomainDns from 'calypso/components/data/query-domain-dns';
import { DnsDetailsProps } from './types';

const DnsDetails = ( {
	dns,
	isRequestingDomains,
	selectedDomainName,
}: DnsDetailsProps ): JSX.Element => {
	const showPlaceholder = ! dns.hasLoadedFromServer || isRequestingDomains;

	return (
		<>
			<div className="dns-card">
				{ /* DNS Placeholder */ }
				<QueryDomainDns domain={ selectedDomainName } />
				{ showPlaceholder ? 'Loading DNS' : 'DNS loaded' }
			</div>
		</>
	);
};

export default DnsDetails;
