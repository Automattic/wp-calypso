/* eslint-disable wpcalypso/jsx-classname-namespace */

import { Button } from '@automattic/components';
import { useTranslate } from 'i18n-calypso';
import QueryDomainDns from 'calypso/components/data/query-domain-dns';
import { domainConnect } from 'calypso/lib/domains/constants';
import { DnsRecord, DnsRecordType } from 'calypso/lib/domains/types';
import { domainManagementDns } from 'calypso/my-sites/domains/paths';
import DnsRecordItem from './dns-record-item';
import DnsRecordItemPlaceholder from './dns-record-item-placeholder';
import type { DnsDetailsProps } from './types';

import './style.scss';

const DnsDetails = ( {
	dns,
	selectedDomain,
	selectedDomainName,
	currentRoute,
	selectedSite,
	showDetails,
}: DnsDetailsProps ) => {
	const showPlaceholder = ! dns.hasLoadedFromServer;
	const translate = useTranslate();

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
			type: 'TXT' as DnsRecordType,
			id: '',
			domain: '',
			protected_field: false,
		};

		return (
			<DnsRecordItem
				key="domain-connect-record"
				dnsRecord={ record }
				selectedDomainName={ selectedDomainName }
			/>
		);
	};

	const renderDomains = () => {
		let domainConnectRecordIsEnabled = false;
		const showDNSSummary = ! showDetails === false;

		const domains = dns.records.map( ( dnsRecord, index ) => {
			const isRootRecord = dnsRecord.name === `${ selectedDomainName }.`;

			// We want to hide root NS records for root domains, but not for subdomains
			if ( 'NS' === dnsRecord.type && ! selectedDomain.isSubdomain && isRootRecord ) {
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
				{ showDNSSummary && domains }
				{ showDNSSummary && domainConnectRecordIsEnabled && getDomainConnectDnsRecord() }
				<Button
					className="dns-card__button"
					href={ domainManagementDns( selectedSite.slug, selectedDomainName, currentRoute ) }
				>
					{ translate( 'Manage' ) }
				</Button>
			</>
		);
	};

	return (
		<>
			<div className="dns-card">
				<QueryDomainDns domain={ selectedDomainName } />
				{ showPlaceholder ? (
					<>
						<DnsRecordItemPlaceholder />
						<DnsRecordItemPlaceholder />
						<DnsRecordItemPlaceholder />
					</>
				) : (
					renderDomains()
				) }
			</div>
		</>
	);
};

export default DnsDetails;
