/**
 * External dependencies
 */
import endsWith from 'lodash/endsWith';
import filter from 'lodash/filter';
import find from 'lodash/find';
import includes from 'lodash/includes';
import mapValues from 'lodash/mapValues';
import startsWith from 'lodash/startsWith';
import trimStart from 'lodash/trimStart';
import without from 'lodash/without';
import matches from 'lodash/matches';
import negate from 'lodash/negate';

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
	// The leading '_' in SRV's service field is a convention
	// The record itself should not contain it
	if ( record.service ) {
		normalizedRecord.service = trimStart( record.service, '_' );
	}

	return normalizedRecord;
}

function getNormalizedName( name, type, selectedDomainName ) {
	const endsWithDomain = endsWith( name, '.' + selectedDomainName );

	if ( isRootDomain( name, selectedDomainName ) && canBeRootDomain( type ) ) {
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
		'@.' + domainName + '.' ];
	return ! name || includes( rootDomainVariations, name );
}

function canBeRootDomain( type ) {
	return includes( [ 'A', 'MX', 'SRV', 'TXT' ], type );
}

function getFieldWithDot( field ) {
	// something that looks like domain but doesn't end with a dot
	return ( typeof field === 'string' && field.match( /^([a-z0-9-_]+\.)+\.?[a-z]+$/i ) ) ? field + '.' : field;
}

function isWpcomRecord( record ) {
	return startsWith( record.id, 'wpcom:' );
}

function isRootARecord( domain ) {
	return matches( {
		type: 'A',
		name: `${domain}.`
	} );
}

function removeDuplicateWpcomRecords( domain, records ) {
	const rootARecords = filter( records, isRootARecord( domain ) ),
		wpcomARecord = find( rootARecords, isWpcomRecord ),
		customARecord = find( rootARecords, negate( isWpcomRecord ) );

	if ( wpcomARecord && customARecord ) {
		return without( records, wpcomARecord );
	}

	return records;
}

function addMissingWpcomRecords( domain, records ) {
	const rootARecords = filter( records, isRootARecord( domain ) );

	if ( rootARecords.length === 0 ) {
		const defaultRootARecord = {
			domain,
			id: `wpcom:A:${domain}.:${domain}`,
			name: `${domain}.`,
			protected_field: true,
			type: 'A'
		};

		return records.concat( [ defaultRootARecord ] );
	}

	return records;
}

function isBeingProcessed( record ) {
	return record.isBeingDeleted || record.isBeingAdded;
}

function isDeletingLastMXRecord( recordToDelete, records ) {
	const currentMXRecords = filter( records, { type: 'MX' } );

	return (
		recordToDelete.type === 'MX' &&
		currentMXRecords.length === 1
	);
}

export {
	addMissingWpcomRecords,
	getNormalizedData,
	removeDuplicateWpcomRecords,
	validateAllFields,
	isBeingProcessed,
	isDeletingLastMXRecord
};
