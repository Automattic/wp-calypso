/**
 * External dependencies
 */
const includes = require( 'lodash/collection/includes' ),
	mapValues = require( 'lodash/object/mapValues' ),
	endsWith = require( 'lodash/string/endsWith' );

function validateAllFields( fieldValues, selectedDomainName ) {
	return mapValues( fieldValues, ( value, fieldName ) => {
		const isValid = validateField( {
			name: fieldName,
			value: value,
			type: fieldValues.type,
			selectedDomainName
		} );

		return isValid ? [] : [ 'Invalid' ];
	} );
}

function validateField( { name, value, type, selectedDomainName } ) {
	switch ( name ) {
		case 'name':
			return isValidName( value, type, selectedDomainName );
		case 'target':
			return isValidDomainName( value, type );
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

/*
 * As per RFC 2181, there's actually only one restriction for DNS records - length.
 * But to keep things sane, we only allow host names for A/AAAA records (RFC 952 and RFC 1123)
 * and more loosely defined domain names for other records.
 */
function isValidDomainName( name, type ) {
	if ( name.length > 253 ) {
		return false;
	}
	switch ( type ) {
		case 'A':
		case 'AAAA':
			return /^([a-z0-9]([a-z0-9\-]*[a-z0-9])?\.)+[a-z0-9]([a-z0-9\-]*[a-z0-9])?\.[a-z]{2,63}$/i.test( name );
		default:
			return /^([a-z0-9-_]{1,63}\.)*[a-z0-9-]{1,63}\.[a-z]{2,63}$/i.test( name );
	}
}

function isValidName( name, type, selectedDomainName ) {
	switch ( type ) {
		case 'A':
		case 'AAAA':
		case 'CNAME':
			return (
				isValidSubdomain( name, selectedDomainName ) &&
				isValidDomainName( name, type )
			);
		case 'SRV':
			return (
				name === '' ||
				isValidDomainName( name, type )
			);
		default:
			return isValidDomainName( name, type );
	}
}

function isValidSubdomain( name, selectedDomainName ) {
	return endsWith( name, '.' + selectedDomainName );
}

function isValidData( data, type ) {
	switch ( type ) {
		case 'A':
			return data.match( /^(\d{1,3}\.){3}\d{1,3}$/ );
		case 'AAAA':
			return data.match( /^[a-f0-9\:]+$/i );
		case 'CNAME':
		case 'MX':
			return isValidDomainName( data, type );
		case 'TXT':
			return data.length < 256;
	}
}

function getNormalizedData( fieldValues, selectedDomainName ) {
	var data = fieldValues;

	data.data = getFieldWithDot( data.data );
	data.name = getFieldWithDot( data.name );

	if ( includes( [ 'A', 'AAAA' ], data.type ) ) {
		data.name = removeTrailingDomain( data.name, selectedDomainName );
	}

	if ( data.target ) {
		data.target = getFieldWithDot( data.target );
	}

	return data;
}

function removeTrailingDomain( domain, trailing ) {
	return domain.replace( new RegExp( '\\.+' + trailing + '\\.?$', 'i' ), '' );
}

function getFieldWithDot( field ) {
	// something that looks like domain but doesn't end with a dot
	return ( typeof field === 'string' && field.match( /^([a-z0-9-_]+\.)+\.?[a-z]+$/i ) ) ? field + '.' : field;
}

module.exports = {
	validateAllFields,
	getNormalizedData
};
