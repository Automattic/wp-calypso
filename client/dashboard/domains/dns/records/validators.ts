import { NormalizedField } from '@wordpress/dataviews';
import { __ } from '@wordpress/i18n';
import { isRootDomainNameSupported } from '../utils';
import type { DnsRecordFormData } from './dns-record-configs';
import type { DnsRecordType } from '../../../data/domain-dns-records';

/**
 * Check if the provided `name` is a valid hostname according to the record type
 *
 * @param name - The name of the DNS record
 * @param type - The type of the DNS record
 * @param domainName - The domain name
 * @returns True if the name is valid, false otherwise
 */
const isValidName = ( name: string, type: DnsRecordType, domainName: string ): boolean => {
	if ( isRootDomainNameSupported( name, type, domainName ) ) {
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

/* translators: This is the error message when the `name` field of a DNS record is invalid */
export const hostnameValidator = ( errorMessage: string = __( 'Please enter a valid name.' ) ) => {
	return ( formData: DnsRecordFormData, field: NormalizedField< DnsRecordFormData > ) => {
		const value = formData[ field.id as keyof DnsRecordFormData ] as string;
		const type = formData.type;
		const domain = formData.domain;
		return isValidName( value, type, domain ) ? null : errorMessage;
	};
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

export const ipv4Validator = (
	/* translators: This is the error message when the `data` field of a DNS A record is invalid */
	errorMessage: string = __( 'Please enter a valid IPv4 address.' )
) => {
	return ( formData: DnsRecordFormData, field: NormalizedField< DnsRecordFormData > ) => {
		const value = formData[ field.id as keyof DnsRecordFormData ] as string;
		return isValidIPv4( value ) ? null : errorMessage;
	};
};

const isValidIPv6 = ( value: string ): boolean => {
	// TODO: This was copied from `client/state/domains/dns/utils.js`, but I don't think this is correct
	return /^[a-f0-9:]+$/i.test( value );
};

export const ipv6Validator = (
	/* translators: This is the error message when the `data` field of a DNS AAAA record is invalid */
	errorMessage: string = __( 'Please enter a valid IPv6 address.' )
) => {
	return ( formData: DnsRecordFormData, field: NormalizedField< DnsRecordFormData > ) => {
		const value = formData[ field.id as keyof DnsRecordFormData ] as string;
		return isValidIPv6( value ) ? null : errorMessage;
	};
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

export const domainValidator = ( errorMessage: string ) => {
	return ( formData: DnsRecordFormData, field: NormalizedField< DnsRecordFormData > ) => {
		const value = formData[ field.id as keyof DnsRecordFormData ] as string;
		const recordType = formData.type;
		return isValidDomain( value, recordType ) ? null : errorMessage;
	};
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
		/* translators: This is the error message when the `ttl` field of a DNS record is invalid */
		__( 'Please enter a TTL value between 300 and 86400.' )
	);
};

export const stringLengthValidator = (
	/* translators: This is the error message when the `data` field of a DNS CAA or TXT record is invalid */
	errorMessage: string = __( 'Please enter a string between 0 and 2048 characters.' )
) => {
	return ( formData: DnsRecordFormData, field: NormalizedField< DnsRecordFormData > ) => {
		const value = formData[ field.id as keyof DnsRecordFormData ] as string;
		return 0 < value.length && value.length <= 2048 ? null : errorMessage;
	};
};

/**
 * Checks if the provided value starts with a space or a dot
 *
 * This is used to validate the `service` field of an SRV record.
 */
/* translators: This is the error message when the `service` field of a DNS SRV record is invalid */
export const serviceValidator = ( errorMessage: string = __( 'Please enter a value.' ) ) => {
	return ( formData: DnsRecordFormData, field: NormalizedField< DnsRecordFormData > ) => {
		const value = formData[ field.id as keyof DnsRecordFormData ] as string;
		return /^[^\s.]+$/.test( value ) ? null : errorMessage;
	};
};
