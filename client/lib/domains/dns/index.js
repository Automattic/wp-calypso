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
			return isValidDomainName( value );
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

function isValidDomainName( name ) {
	return /^([\da-z-]+\.)+[\da-z-]+$/i.test( name );
}

function isValidName( name, type, selectedDomainName ) {
	switch ( type ) {
		case 'CNAME':
			return (
				isValidCname( name, selectedDomainName ) &&
				isValidDomainName( name )
			);
		default:
			return isValidDomainName( name );
	}
}

function isValidCname( name, selectedDomainName ) {
	return (
		name !== selectedDomainName &&
		endsWith( name, selectedDomainName )
	);
}

function isValidData( data, type ) {
	switch ( type ) {
		case 'A':
			return data.match( /^(\d{1,3}\.){3}\d{1,3}$/ );
		case 'AAAA':
			return data.match( /^[a-f0-9\:]+$/i );
		case 'CNAME':
		case 'MX':
			return isValidDomainName( data );
		case 'TXT':
			return data.length < 256;
	}
}

function getNormalizedData( fieldValues, selectedDomainName ) {
	var data = fieldValues;

	data.data = getFieldWithDot( data.data );

	if ( includes( [ 'A', 'AAAA' ], data.type ) ) {
		data.name = removeTrailingDomain( data.name, selectedDomainName );
	}

	data.name = getFieldWithDot( data.name );

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
	return ( typeof field === 'string' && field.match( /^([a-z0-9-]+\.)+\.?[a-z]+$/i ) ) ? field + '.' : field;
}

module.exports = {
	validateAllFields,
	getNormalizedData
};
