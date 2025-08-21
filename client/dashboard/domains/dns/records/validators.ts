import { NormalizedField } from '@wordpress/dataviews';
import { __ } from '@wordpress/i18n';
import type { DnsRecordFormData } from './dns-record-configs';
import type { DnsRecordType } from '../../../data/domain-dns-records';

/**
 * Check if the provided name is the root domain name
 *
 * @param name - The name to check
 * @param domainName - The domain name
 * @returns True if the name is the root domain name, false otherwise
 */
const isRootDomain = ( name: string, domainName: string ): boolean => {
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
const isRootDomainNameSupported = ( type: DnsRecordType ): boolean => {
	// TODO: Root NS records can be edited only for subdomains, but we don't have the domain object here.
	// It's not reliable to determine whether a domain is a subdomain in the frontend, so we'll need
	// to get this information from the backend.
	return [ 'A', 'AAAA', 'ALIAS', 'CAA', 'MX', 'SRV', 'TXT' ].includes( type );
};

/**
 * Check if the provided `name` is a valid hostname according to the record type
 *
 * @param name - The name of the DNS record
 * @param type - The type of the DNS record
 * @param domainName - The domain name
 * @returns True if the name is valid, false otherwise
 */
const isValidName = ( name: string, type: DnsRecordType, domainName: string ): boolean => {
	if ( isRootDomain( name, domainName ) && isRootDomainNameSupported( type ) ) {
		return true;
	}

	switch ( type ) {
		case 'A':
		case 'AAAA':
			return /^([a-z0-9]([a-z0-9-]*[a-z0-9])?\.)*[a-z0-9]([a-z0-9-]*[a-z0-9])?$/i.test( name );
		case 'CNAME':
			return /^([a-z0-9-_]{1,63}\.)*([a-z0-9-_]{1,63})$/i.test( name ) || name === '*';
		case 'TXT':
			return /^(\*\.|)([a-z0-9-_]{1,63}\.)*([a-z0-9-_]{1,63})$/i.test( name );
		default:
			return /^([a-z0-9-_]{1,63}\.)*([a-z0-9-_]{1,63})$/i.test( name );
	}
};

export const hostnameValidator =
	( errorMessage: string = __( 'Please enter a valid name.' ) ) =>
	( formData: DnsRecordFormData, field: NormalizedField< DnsRecordFormData > ) => {
		const value = formData[ field.id as keyof DnsRecordFormData ] as string;
		const type = formData.type;
		const domain = formData.domain;
		return isValidName( value, type, domain ) ? null : errorMessage;
	};

const isValidIPv4 = ( value: string ): boolean => {
	return (
		/^(\d{1,3}\.){3}\d{1,3}$/.test( value ) &&
		value.split( '.' ).every( ( octet ) => {
			const num = parseInt( octet, 10 );
			return num >= 0 && num <= 255;
		} )
	);
};

export const ipv4Validator =
	( errorMessage: string = __( 'Please enter a valid IPv4 address.' ) ) =>
	( formData: DnsRecordFormData, field: NormalizedField< DnsRecordFormData > ) => {
		const value = formData[ field.id as keyof DnsRecordFormData ] as string;
		return isValidIPv4( value ) ? null : errorMessage;
	};

const isValidIPv6 = ( value: string ): boolean => {
	// TODO: This was copied from `client/state/domains/dns/utils.js`, but I don't think this is correct
	return /^[a-f0-9:]+$/i.test( value );
};

export const ipv6Validator =
	( errorMessage: string = __( 'Please enter a valid IPv6 address.' ) ) =>
	( formData: DnsRecordFormData, field: NormalizedField< DnsRecordFormData > ) => {
		const value = formData[ field.id as keyof DnsRecordFormData ] as string;
		return isValidIPv6( value ) ? null : errorMessage;
	};

const isValidDomain = ( value: string, recordType: DnsRecordType ): boolean => {
	const maxLength = value.endsWith( '.' ) ? 254 : 253;

	if ( value.length > maxLength ) {
		return false;
	}

	if ( recordType === 'SRV' && value === '.' ) {
		return true;
	}

	return /^([a-z0-9-_]{1,63}\.)*[a-z0-9-]{1,63}\.[a-z]{2,63}(\.)?$/i.test( value );
};

export const domainValidator =
	( errorMessage: string = __( 'Please enter a valid domain.' ) ) =>
	( formData: DnsRecordFormData, field: NormalizedField< DnsRecordFormData > ) => {
		const value = formData[ field.id as keyof DnsRecordFormData ] as string;
		const recordType = formData.type;
		return isValidDomain( value, recordType ) ? null : errorMessage;
	};

export const numberRangeValidator =
	( min: number, max: number, errorMessage: string ) =>
	( formData: DnsRecordFormData, field: NormalizedField< DnsRecordFormData > ) => {
		const value = formData[ field.id as keyof DnsRecordFormData ] as number;
		return min <= value && value <= max ? null : errorMessage;
	};

export const ttlValidator = () => {
	return numberRangeValidator(
		300,
		86400,
		__( 'Please enter a TTL value between 300 and 86400.' )
	);
};

export const stringLengthValidator =
	( errorMessage: string = __( 'Please enter a string between 0 and 2048 characters.' ) ) =>
	( formData: DnsRecordFormData, field: NormalizedField< DnsRecordFormData > ) => {
		const value = formData[ field.id as keyof DnsRecordFormData ] as string;
		return 0 < value.length && value.length <= 2048 ? null : errorMessage;
	};

/**
 * Checks if the provided `value` doesn't start with a space or a dot
 */
export const serviceValidator =
	( errorMessage: string = __( 'Please enter a value.' ) ) =>
	( formData: DnsRecordFormData, field: NormalizedField< DnsRecordFormData > ) => {
		const value = formData[ field.id as keyof DnsRecordFormData ] as string;
		return /^[^\s.]+$/.test( value ) ? null : errorMessage;
	};
