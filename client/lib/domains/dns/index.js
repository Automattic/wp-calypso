/**
 * External dependencies
 */
const includes = require( 'lodash/includes' ),
	mapValues = require( 'lodash/mapValues' ),
	endsWith = require( 'lodash/endsWith' );

function validateAllFields( fieldValues, domainName ) {
	return mapValues( fieldValues, ( value, fieldName ) => {
		const isValid = validateField( {
			value,
			domainName,
			name: fieldName,
			type: fieldValues.type,
		} );

		return isValid ? [] : [ 'Invalid' ];
	} );
}

function validateField( { name, value, type, domainName } ) {
	switch ( name ) {
		case 'name':
			return isValidName( value, type, domainName );
		case 'target':
			return isValidDomain( value, type );
		case 'data':
			return isValidData( value, type );
		case 'protocol':
			return includes( [ 'tcp', 'udp', 'tls' ], value );
		case 'weight':
		case 'aux':
		case 'port':
			return value.toString().match( /^\d{1,5}$/ );
		case 'service':
			return value.match( /^[^\s\.]+$/ );
		default:
			return true;
	}
}

function isValidDomain( name ) {
	if ( name.length > 253 ) {
		return false;
	}
	return /^([a-z0-9-_]{1,63}\.)*[a-z0-9-]{1,63}\.[a-z]{2,63}$/i.test( name );
}

function isValidName( name, type, domainName ) {
	if ( isRootDomain( name, domainName ) && canBeRootDomain( type ) ) {
		return true;
	}

	switch ( type ) {
		case 'A':
		case 'AAAA':
			return /^([a-z0-9]([a-z0-9-]*[a-z0-9])?\.)*[a-z0-9]([a-z0-9-]*[a-z0-9])?$/i.test( name );
		default:
			return /^([a-z0-9-_]{1,63}\.)*([a-z0-9-_]{1,63})$/i.test( name );
	}
}

function isValidData( data, type ) {
	switch ( type ) {
		case 'A':
			return data.match( /^(\d{1,3}\.){3}\d{1,3}$/ );
		case 'AAAA':
			return data.match( /^[a-f0-9\:]+$/i );
		case 'CNAME':
		case 'MX':
			return isValidDomain( data );
		case 'TXT':
			return data.length > 0 && data.length < 256;
	}
}

function getNormalizedData( record, selectedDomainName ) {
	const normalizedRecord = Object.assign( {}, record );
	normalizedRecord.data = getFieldWithDot( record.data );
	normalizedRecord.name = getNormalizedName( record.name, record.type, selectedDomainName );
	if ( record.target ) {
		normalizedRecord.target = getFieldWithDot( record.target );
	}

	return normalizedRecord;
}

function getNormalizedName( name, type, selectedDomainName ) {
	const endsWithDomain = endsWith( name, '.' + selectedDomainName );

	if ( isRootDomain( name, selectedDomainName ) && canBeRootDomain( type ) ) {
		return '';
	}

	if ( endsWithDomain ) {
		if ( isIpRecord( type ) ) {
			return name.replace( new RegExp( '\\.+' + selectedDomainName + '\\.?$', 'i' ), '' );
		}
		return getFieldWithDot( name );
	} else if ( ! isIpRecord( type ) ) {
		return name + '.' + selectedDomainName + '.';
	}
	return name;
}

function isIpRecord( type ) {
	return includes( [ 'A', 'AAAA' ], type );
}

function isRootDomain( name, domainName ) {
	const rootDomainVariations = [
		'@',
		domainName,
		domainName + '.',
		'@.' + domainName,
		'@.' + domainName + '.' ];
	return ! name || includes( rootDomainVariations, name );
}

function canBeRootDomain( type ) {
	return includes( [ 'MX', 'SRV', 'TXT' ], type );
}

function getFieldWithDot( field ) {
	// something that looks like domain but doesn't end with a dot
	return ( typeof field === 'string' && field.match( /^([a-z0-9-_]+\.)+\.?[a-z]+$/i ) ) ? field + '.' : field;
}

module.exports = {
	validateAllFields,
	getNormalizedData
};
