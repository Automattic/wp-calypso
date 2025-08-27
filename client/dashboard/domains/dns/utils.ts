import type { DnsRecord, DnsRecordType } from '../../data/domain-dns-records';

/**
 * Check if the provided name is the root domain name
 *
 * This checks a few different variations of the root domain name, such as
 * `@`, `@.example.com`, `@.example.com.`, `example.com` and `example.com.`.
 *
 * @param name - The name to check
 * @param domainName - The domain name
 * @returns True if the name is the root domain name, false otherwise
 */
const isRootDomainName = ( name: string, domainName: string ): boolean => {
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
const doesRecordTypeSupportRootDomainName = ( type: DnsRecordType ): boolean => {
	// TODO: Root NS records can be edited only for subdomains, but we don't have the domain object here.
	// It's not reliable to determine whether a domain is a subdomain in the frontend, so we'll need
	// to get this information from the backend.
	return [ 'A', 'AAAA', 'ALIAS', 'CAA', 'MX', 'SRV', 'TXT' ].includes( type );
};

/**
 * Check if the provided name is the root domain name and the record type supports those
 *
 * @param name - The name of the DNS record
 * @param type - The type of the DNS record
 * @param domainName - The domain name
 * @returns True if the name is the root domain name and the record type supports it, false otherwise
 */
export const isRootDomainNameSupported = (
	name: string,
	type: DnsRecordType,
	domainName: string
): boolean => {
	return isRootDomainName( name, domainName ) && doesRecordTypeSupportRootDomainName( type );
};

/**
 * Add a dot to the end of the field if it doesn't have one to make it a FQDN
 *
 * @param field - The field to add a dot to
 * @returns The field with a dot
 */
export const getFieldWithDot = ( field: string ) => {
	if ( field.endsWith( '.' ) ) {
		return field;
	}
	return field + '.';
};

/**
 * Normalizes the `name` field of a DNS record
 *
 * This is done before persisting a DNS record.
 * For example, if the `name` field is `@`, it will be normalized to `example.com.`.
 *
 * @param name - The `name` field of the DNS record
 * @param type - The type of the DNS record
 * @param domainName - The domain name
 * @returns The normalized `name` field
 */
export const getNormalizedName = ( name: string, type: DnsRecordType, domainName: string ) => {
	if ( isRootDomainNameSupported( name, type, domainName ) ) {
		return domainName + '.';
	}

	// If `name` is a subdomain, e.g. `www.example.com`, return only `www`
	if ( name.endsWith( '.' + domainName ) ) {
		return name.replace( new RegExp( '\\.+' + domainName + '\\.?$', 'i' ), '' );
	}

	return name;
};

/**
 * Processes the record data to show it in a more readable format
 *
 * This is done after loading a DNS record from the backend.
 * For example, `name` fields that are the root domain name are replaced with an empty string.
 *
 * @param record
 * @returns
 */
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
