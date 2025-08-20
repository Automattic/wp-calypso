import { NormalizedField } from '@wordpress/dataviews';
import { __ } from '@wordpress/i18n';
import type { DnsRecordFormData } from './dns-record-configs';
import type { DnsRecordType } from '../../../data/domain-dns-records';

const isValidHostname = ( value: string ): boolean => {
	return /^([a-z0-9]([a-z0-9-]*[a-z0-9])?\.)*[a-z0-9]([a-z0-9-]*[a-z0-9])?$/i.test( value );
};

// const isRootDomain = ( name: string, domainName: string ): boolean => {
// 	const rootDomainVariations = [
// 		'@',
// 		domainName,
// 		domainName + '.',
// 		'@.' + domainName,
// 		'@.' + domainName + '.',
// 	];
// 	return ! name || rootDomainVariations.includes( name );
// };

// const canBeRootDomain = ( type: DnsRecordType, domain: string ): boolean => {
// 	// Root NS records can be edited only for subdomains
// 	if ( type === 'NS' && domain?.isSubdomain ) {
// 		return true;
// 	}

// 	return [ 'A', 'AAAA', 'ALIAS', 'CAA', 'MX', 'SRV', 'TXT' ].includes( type );
// };

// const isValidName = (
// 	name: string,
// 	type: DnsRecordType,
// 	domainName: string,
// 	domain: string
// ): boolean => {
// 	if ( isRootDomain( name, domainName ) && canBeRootDomain( type, domain ) ) {
// 		return true;
// 	}

// 	switch ( type ) {
// 		case 'A':
// 		case 'AAAA':
// 			return /^([a-z0-9]([a-z0-9-]*[a-z0-9])?\.)*[a-z0-9]([a-z0-9-]*[a-z0-9])?$/i.test( name );
// 		case 'CNAME':
// 			return /^([a-z0-9-_]{1,63}\.)*([a-z0-9-_]{1,63})$/i.test( name ) || name === '*';
// 		case 'TXT':
// 			return /^(\*\.|)([a-z0-9-_]{1,63}\.)*([a-z0-9-_]{1,63})$/i.test( name );
// 		default:
// 			return /^([a-z0-9-_]{1,63}\.)*([a-z0-9-_]{1,63})$/i.test( name );
// 	}
// };

export const requiredHostnameValidator =
	( errorMessage: string = __( 'Please enter a valid name.' ) ) =>
	( formData: DnsRecordFormData, field: NormalizedField< DnsRecordFormData > ) => {
		const value = formData[ field.id as keyof DnsRecordFormData ] as string;
		return isValidHostname( value ) ? null : errorMessage;
	};

export const optionalHostnameValidator =
	( errorMessage: string = __( 'Please enter a valid name.' ) ) =>
	( formData: DnsRecordFormData, field: NormalizedField< DnsRecordFormData > ) => {
		const value = formData[ field.id as keyof DnsRecordFormData ] as string;
		if ( value === '' ) {
			return null;
		}
		return isValidHostname( value ) ? null : errorMessage;
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
	( recordType: DnsRecordType, errorMessage: string = __( 'Please enter a valid domain.' ) ) =>
	( formData: DnsRecordFormData, field: NormalizedField< DnsRecordFormData > ) => {
		const value = formData[ field.id as keyof DnsRecordFormData ] as string;
		return isValidDomain( value, recordType ) ? null : errorMessage;
	};

export const numberRangeValidator =
	( min: number, max: number, errorMessage: string ) =>
	( formData: DnsRecordFormData, field: NormalizedField< DnsRecordFormData > ) => {
		const value = formData[ field.id as keyof DnsRecordFormData ] as number;
		return min <= value && value <= max ? null : errorMessage;
	};

export const ttlValidator = () =>
	numberRangeValidator( 300, 86400, __( 'Please enter a TTL value between 300 and 86400.' ) );
