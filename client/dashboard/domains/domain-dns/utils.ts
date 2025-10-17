import { DnsRecord } from '@automattic/api-core';

const domainConnect = {
	DISCOVERY_TXT_RECORD_NAME: '_domainconnect',
	API_URL: 'public-api.wordpress.com/rest/v1.3/domain-connect',
};

function hasDefaultARecords( records: DnsRecord[] ) {
	return records.some( ( record ) => record?.type === 'A' && record?.protected_field );
}

function hasDefaultCnameRecord( records: DnsRecord[], domainName: string ): boolean {
	return records.some(
		( record ) =>
			record.type === 'CNAME' && record.name === 'www' && record.data === `${ domainName }.`
	);
}

function hasDefaultEmailRecords( records: DnsRecord[], domainName: string ): boolean {
	const hasDefaultDkim1Record = records?.some(
		( record ) =>
			record.type === 'CNAME' &&
			record.name === 'wpcloud1._domainkey' &&
			record.data === 'wpcloud1._domainkey.wpcloud.com.'
	);
	const hasDefaultDkim2Record = records?.some(
		( record ) =>
			record?.type === 'CNAME' &&
			record.name === 'wpcloud2._domainkey' &&
			record.data === 'wpcloud2._domainkey.wpcloud.com.'
	);
	const hasDefaultDmarcRecord = records?.some(
		( record ) =>
			record.type === 'TXT' && record.name === '_dmarc' && record.data?.startsWith( 'v=DMARC1' )
	);
	const hasDefaultSpfRecord = records?.some(
		( record ) =>
			record.type === 'TXT' &&
			record.name === `${ domainName }.` &&
			record.data?.startsWith( 'v=spf1' ) &&
			record.data?.match( /\binclude:_spf.wpcloud.com\b/ )
	);

	return (
		hasDefaultDkim1Record && hasDefaultDkim2Record && hasDefaultDmarcRecord && hasDefaultSpfRecord
	);
}

function isDomainConnectRecord( dnsRecord: DnsRecord ): boolean {
	return (
		domainConnect.DISCOVERY_TXT_RECORD_NAME === dnsRecord.name &&
		domainConnect.API_URL === dnsRecord.data &&
		'TXT' === dnsRecord.type
	);
}

export { hasDefaultARecords, hasDefaultCnameRecord, hasDefaultEmailRecords, isDomainConnectRecord };
