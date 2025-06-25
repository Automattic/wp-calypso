import { filter, mapValues } from 'lodash';

function validateAllFields( fieldValues, domainName, domain ) {
	return mapValues( fieldValues, ( value, fieldName ) => {
		const isValid = validateField( {
			value,
			domain,
			domainName,
			name: fieldName,
			type: fieldValues.type,
		} );

		return isValid ? [] : [ 'Invalid' ];
	} );
}

function validateField( { name, value, type, domain, domainName } ) {
	switch ( name ) {
		case 'name':
			return isValidName( value, type, domainName, domain );
		case 'target':
			return isValidDomain( value, type );
		case 'data':
		case 'value':
			return isValidData( value, type );
		case 'protocol':
			return [ '_tcp', '_udp', '_tls' ].includes( value );
		case 'flags': {
			const intValue = parseInt( value, 10 );
			return intValue >= 0 && intValue <= 255;
		}
		case 'weight':
		case 'aux':
		case 'port': {
			const intValue = parseInt( value, 10 );
			return intValue >= 0 && intValue <= 65535;
		}
		case 'ttl': {
			const intValue = parseInt( value, 10 );
			return intValue >= 300 && intValue <= 86400;
		}
		case 'service':
			return value.match( /^[^\s.]+$/ );
		default:
			return true;
	}
}

function isValidDomain( name, type ) {
	const maxLength = name.endsWith( '.' ) ? 254 : 253;

	if ( name.length > maxLength ) {
		return false;
	}

	if ( type === 'SRV' && name === '.' ) {
		return true;
	}

	return /^([a-z0-9-_]{1,63}\.)*[a-z0-9-]{1,63}\.[a-z]{2,63}(\.)?$/i.test( name );
}

function isValidName( name, type, domainName, domain ) {
	if ( isRootDomain( name, domainName ) && canBeRootDomain( type, domain ) ) {
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
}

function isValidData( data, type ) {
	switch ( type ) {
		case 'A':
			return data.match( /^(\d{1,3}\.){3}\d{1,3}$/ );
		case 'AAAA':
			return data.match( /^[a-f0-9:]+$/i );
		case 'ALIAS':
		case 'CNAME':
		case 'MX':
		case 'NS':
			return isValidDomain( data );
		case 'CAA':
		case 'TXT':
			return data.length > 0 && data.length <= 2048;
	}
}

function getNormalizedData( record, selectedDomainName, selectedDomain ) {
	const normalizedRecord = Object.assign( {}, record );
	normalizedRecord.data = getFieldWithDot( record.data );
	normalizedRecord.name = getNormalizedName(
		record.name,
		record.type,
		selectedDomainName,
		selectedDomain
	);
	if ( record.target ) {
		normalizedRecord.target = getFieldWithDot( record.target );
	}

	return normalizedRecord;
}

function getNormalizedName( name, type, selectedDomainName, selectedDomain ) {
	const endsWithDomain = name.endsWith( '.' + selectedDomainName );

	if ( isRootDomain( name, selectedDomainName ) && canBeRootDomain( type, selectedDomain ) ) {
		return selectedDomainName + '.';
	}

	if ( endsWithDomain ) {
		return name.replace( new RegExp( '\\.+' + selectedDomainName + '\\.?$', 'i' ), '' );
	}

	return name;
}

function isRootDomain( name, domainName ) {
	const rootDomainVariations = [
		'@',
		domainName,
		domainName + '.',
		'@.' + domainName,
		'@.' + domainName + '.',
	];
	return ! name || rootDomainVariations.includes( name );
}

function canBeRootDomain( type, domain ) {
	// Root NS records can be edited only for subdomains
	if ( type === 'NS' && domain?.isSubdomain ) {
		return true;
	}

	return [ 'A', 'AAAA', 'ALIAS', 'CAA', 'MX', 'SRV', 'TXT' ].includes( type );
}

function getFieldWithDot( field ) {
	// something that looks like domain but doesn't end with a dot
	return typeof field === 'string' && field.match( /^([a-z0-9-_]+\.)+\.?[a-z]+$/i )
		? field + '.'
		: field;
}

function isDeletingLastMXRecord( recordToDelete, records ) {
	const currentMXRecords = filter( records, { type: 'MX' } );

	return recordToDelete.type === 'MX' && currentMXRecords.length === 1;
}

export { getNormalizedData, validateAllFields, isDeletingLastMXRecord };
