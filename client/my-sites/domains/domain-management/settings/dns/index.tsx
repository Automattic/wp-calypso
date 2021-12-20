/* eslint-disable wpcalypso/jsx-classname-namespace */

import QueryDomainDns from 'calypso/components/data/query-domain-dns';
import { domainConnect } from 'calypso/lib/domains/constants';
import { DnsRecord, DNSRecordType } from 'calypso/lib/domains/types';
import DnsRecordItem from './dns-record-item';
import { DnsDetailsProps } from './types';

const DnsDetails = ( {
	dns,
	isRequestingDomains,
	selectedDomainName,
}: DnsDetailsProps ): JSX.Element => {
	const showPlaceholder = ! dns.hasLoadedFromServer || isRequestingDomains;

	// This could be moved to an utils file?
	const isDomainConnectRecord = ( dnsRecord: DnsRecord ) => {
		return (
			domainConnect.DISCOVERY_TXT_RECORD_NAME === dnsRecord.name &&
			domainConnect.API_URL === dnsRecord.data &&
			'TXT' === dnsRecord.type
		);
	};

	const getDomainConnectDnsRecord = () => {
		const record = {
			name: domainConnect.DISCOVERY_TXT_RECORD_NAME,
			data: domainConnect.API_URL,
			type: 'TXT' as DNSRecordType,
			id: '',
			domain: '',
			protected_field: false,
		};

		return (
			<DnsRecordItem
				key={ 'domain-connect-record' }
				dnsRecord={ record }
				selectedDomainName={ selectedDomainName }
			/>
		);
	};

	const renderDomains = () => {
		let domainConnectRecordIsEnabled = false;
		const domains = dns.records.map( ( dnsRecord, index ) => {
			if ( 'NS' === dnsRecord.type ) {
				return;
			}
			if ( isDomainConnectRecord( dnsRecord ) ) {
				domainConnectRecordIsEnabled = true;
				return;
			}
			return (
				<DnsRecordItem
					key={ index }
					dnsRecord={ dnsRecord }
					selectedDomainName={ selectedDomainName }
				/>
			);
		} );
		return (
			<>
				{ domains }
				{ domainConnectRecordIsEnabled && getDomainConnectDnsRecord() }
			</>
		);
	};

	return (
		<>
			<div className="dns-card">
				<QueryDomainDns domain={ selectedDomainName } />
				{ showPlaceholder ? 'Loading DNS' : renderDomains() }
			</div>
		</>
	);
};

export default DnsDetails;
