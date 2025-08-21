import type { DnsRecord, DnsRecordType } from '../../data/domain-dns-records';

/**
 * Check if the provided name is the root domain name
 *
 * @param name - The name to check
 * @param domainName - The domain name
 * @returns True if the name is the root domain name, false otherwise
 */
export const isRootDomain = ( name: string, domainName: string ): boolean => {
	if ( name === '' ) {
		return true;
	}

	const rootDomainVariations = [
		'@',
		domainName,
		domainName + '.',
		'@.' + domainName,
		'@.' + domainName + '.',
	];
	return rootDomainVariations.includes( name );
};

/**
 * Check if the DNS record type supports a root domain `name` value
 *
 * @param type - The DNS record type
 * @returns True if the record type supports a root domain `name`, false otherwise
 */
export const isRootDomainNameSupported = ( type: DnsRecordType ): boolean => {
	// TODO: Root NS records can be edited only for subdomains, but we don't have the domain object here.
	// It's not reliable to determine whether a domain is a subdomain in the frontend, so we'll need
	// to get this information from the backend.
	return [ 'A', 'AAAA', 'ALIAS', 'CAA', 'MX', 'SRV', 'TXT' ].includes( type );
};

export const getFieldWithDot = ( field: string ) => {
	// something that looks like domain but doesn't end with a dot
	return typeof field === 'string' && field.match( /^([a-z0-9-_]+\.)+\.?[a-z]+$/i )
		? field + '.'
		: field;
};

export const getNormalizedName = ( name: string, type: DnsRecordType, domainName: string ) => {
	const endsWithDomain = name.endsWith( '.' + domainName );

	if ( isRootDomain( name, domainName ) && isRootDomainNameSupported( type ) ) {
		return domainName + '.';
	}

	if ( endsWithDomain ) {
		return name.replace( new RegExp( '\\.+' + domainName + '\\.?$', 'i' ), '' );
	}

	return name;
};

export const getProcessedRecord = ( record: DnsRecord ): DnsRecord => {
	const isRootDomainRecord = record.name === `${ record.domain }.`;
	if ( isRootDomainRecord ) {
		record.name = '';
	}

	if ( record.type !== 'TXT' ) {
		record.data = record.data ? record.data.replace( /\.$/, '' ) : '';
	}

	// Make sure we can handle protocols with and without a leading underscore
	if ( record.type === 'SRV' && record.protocol !== undefined ) {
		record.protocol = record.protocol.replace( /^_*/, '_' );
	}

	// SRV records can have a target of '.', which means that service is unavailable.
	// This condition prevents that dot from being removed in those cases.
	if ( ! ( record.type === 'SRV' && record.target === '.' ) ) {
		record.target = record.target ? record.target.replace( /\.$/, '' ) : '';
	}

	return record;
};
