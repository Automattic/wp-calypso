#!/usr/bin/env node
require( 'babel-register' );
var request = require( 'request' );
var vm = require( 'vm' );
var _ = require( 'lodash' );
var assert = require( 'assert' );
var path = require( 'path' );
var fs = require( 'fs' );
var forIn = require( 'lodash/forIn' );
var mapValues = require( 'lodash/mapValues' );
var orderBy = require( 'lodash/orderBy' );
var last = require( 'lodash/last' );
var includes = require( 'lodash/includes' );

var areaCodes = {
	CA: [ "204", "236", "249", "250", "289", "306", "343", "365", "387", "403", "416", "418", "431", "437", "438", "450", "506", "514", "519", "548", "579", "581", "587", "604", "613", "639", "647", "672", "705", "709", "742", "778", "780", "782", "807", "819", "825", "867", "873", "902", "905" ],
	DO: [ "809", "829", "849" ],
	PR: [ "787", "939" ]
};

/**
 * Some countries share a dial code and need a priority order to make an early guess. These are made up numbers to order
 * the countries by their population.
 * Priorities should be distinct among the same dial code group.
 * @type Object
 */
var priorityData = {
	// dial code: +1
	US: 10,
	CA: 5,
	DO: 3,
	PR: 1,
	UM: -99,
	// dial code: +7
	RU: 10,
	KZ: 1,
	// dial code: +39
	IT: 10,
	VA: 1,
	// dial code: +44
	GB: 10,
	JE: 5,
	IM: 3,
	GG: 1,
	// dial code: +47
	NO: 10,
	SJ: 1,
	BV: -99,
	// dial code: +61
	AU: 10,
	CX: 5,
	CC: 1,
	HM: -99,
	// dial code: +64
	NZ: 10,
	PN: -99,
	// dial code: +290
	SH: 10,
	TA: 1,
	// dial code: +358
	FI: 10,
	AX: 1,
	// dial code: +500
	FK: 10,
	GS: -99,
	// dial code: +590
	GP: 10,
	MF: 5,
	BL: 1,
	// dial code: +599
	CW: 10,
	BQ: 1
};

var LIBPHONENUMBER_METADATA_URL = 'https://raw.githubusercontent.com/googlei18n/libphonenumber/master/javascript/i18n/phonenumbers/metadatalite.js';

var libPhoneNumberIndexes = {
	COUNTRY_CODE: 9,
	COUNTRY_DIAL_CODE: 10,
	INTERNATIONAL_PREFIX: 11,
	NATIONAL_PREFIX: 12,
	NATIONAL_PARSING_PREFIX: 15,
	NUMBER_FORMAT: 19,
	INTERNATIONAL_NUMBER_FORMAT: 20, // TYPE: NumberFormat,
	REGION_AREA_CODE: 23
};

var numberFormatIndexes = {
	PATTERN: 1,
	FORMAT: 2,
	LEADING_DIGIT_PATTERN: 3,
	NATIONAL_CALLING_FORMAT: 4
};

var aliases = {
	UK: 'GB'
};

function tabs( depth ) {
	return _.times( depth, _.constant( '\t' ) ).join( '' );
}

function getLibPhoneNumberData() {
	return new Promise( function( resolve, reject ) {
		request.get( LIBPHONENUMBER_METADATA_URL, function( error, response, body ) {
			if ( error || response.statusCode >= 400 ) {
				throw error || response.statusCode;
			}

			var capture = body.substring( body.indexOf( 'countryToMetadata = ' ) + 20, body.length - 2 );
			var sandbox = { container: {} };
			var script = new vm.Script( 'container.data = ' + capture );

			try {
				script.runInNewContext( sandbox );
			} catch ( e ) {
				reject( e );
			}

			if ( sandbox.container.data ) {
				resolve( sandbox.container.data );
			} else {
				reject( new Error( 'Failed to parse data' ) );
			}
		} );
	} );
}

function processNumberFormat( format ) {
	return {
		match: format[ numberFormatIndexes.PATTERN ],
		replace: format[ numberFormatIndexes.FORMAT ],
		nationalFormat: format[ numberFormatIndexes.NATIONAL_CALLING_FORMAT ] || undefined,
		leadingDigitPattern: last( format[ numberFormatIndexes.LEADING_DIGIT_PATTERN ] || [] )
	}
}

function parseJSStringToData( str ) {
	var sandbox = { container: {} };
	var script = new vm.Script( 'container.data = ' + str );
	script.runInNewContext( sandbox );
	return sandbox.container.data;
}

/**
 * Serializes a simple object into a JS script, parseable by an ES5 compiler.
 * @param {*} thing
 * @param {number} [depth=0] Internally used for adding tabs to nested objects.
 * @returns {string} - String representation of the given object.
 */
function toJSString( thing, depth ) {
	depth = depth || 0;
	if ( _.isString( thing ) ) {
		return '"' + thing.replace( /\\/g, '\\\\' ) + '"';
	} else if ( _.isNumber( thing ) ) {
		return thing;
	} else if ( _.isArray( thing ) ) {
		return '[\n' + thing.map( function( val ) {
				return tabs( depth + 1 ) + toJSString( val, depth + 1 );
			} ).join( ',\n' ) + '\n' + tabs( depth ) + ']'
	} else if ( _.isUndefined( thing ) ) {
		return 'undefined';
	} else if ( _.isNull( thing ) ) {
		return 'null';
	} else if ( _.isBoolean( thing ) ) {
		return thing.toString();
	} else if ( _.isRegExp( thing ) ) {
		return thing;
	} else if ( _.isObject( thing ) ) {
		var res = '{\n';
		const keys = Object.keys( thing );
		res = keys.reduce( function( res, key, idx ) {
			return res + tabs( depth + 1 ) + objectKeyToJSString( key ) + ': ' + toJSString( thing[ key ], depth + 1 ) + ( idx === keys.length - 1 ? '' : ',' ) + '\n'
		}, res );
		res += tabs( depth ) + '}';
		return res;
	} else {
		throw new Error( 'Unsupported thing: ' + thing );
	}
}

function objectKeyToJSString( key ) {
	if ( /[\[\]\|]|(?:^(?:do|if|in|of)$)/.test( key ) ) {
		return '"' + key + '"';
	}
	return key;
}

/**
 * Deeply iterates over the keys of an object to remove any keys that are "undefined". This method modifies the object.
 * @param {Object} obj
 * @returns {Object} obj, with keys with value "undefined" removed.
 */
function deepRemoveUndefinedKeysFromObject( obj ) {
	for ( var key in obj ) {
		if ( obj.hasOwnProperty( key ) ) {
			if ( _.isUndefined( obj[ key ] ) ) {
				delete obj[ key ];
			} else if ( _.isObject( obj[ key ] ) ) {
				deepRemoveUndefinedKeysFromObject( obj[ key ] );
			}
		}
	}
	return obj;
}

function generateDeepRemoveEmptyArraysFromObject( allowedKeys ) {
	return function deepRemoveEmptyArraysFromObject( obj ) {
		for ( var key in obj ) {
			if ( obj.hasOwnProperty( key ) ) {
				if ( _.includes( allowedKeys, key ) && _.isArray( obj[ key ] ) && obj[ key ].length === 0 ) {
					delete obj[ key ];
				} else if ( _.isObject( obj[ key ] ) ) {
					deepRemoveEmptyArraysFromObject( obj[ key ] );
				}
			}
		}
		return obj;
	}
}

function removeAllNumberKeys( obj ) {
	return _.omitBy( obj, function( val, key ) { return /^\d+$/.test( key ); } );
}

function removeRegionCodeAndCountryDialCodeIfSameWithCountryDialCode( countryData ) {
	for ( var key in countryData ) {
		if ( countryData.hasOwnProperty( key ) ) {
			const country = countryData[ key ],
				{ countryDialCode, dialCode } = country;
			if ( countryDialCode === dialCode ) {
				delete country.regionCode;
				delete country.countryDialCode;
			}
		}
	}
	return countryData;
}

/**
 * Processes Google's libphonenumber data and generates a proper JS object
 * @param {{}} libPhoneNumberData
 * @returns {{}}
 */
function processLibPhoneNumberMetadata( libPhoneNumberData ) {
	var data = {};
	for ( var countryCode in libPhoneNumberData ) {
		if ( libPhoneNumberData.hasOwnProperty( countryCode ) ) {
			var countryCodeUpper = countryCode.toUpperCase();
			var country = libPhoneNumberData[ countryCode ];
			data[ countryCodeUpper ] = {
				isoCode: countryCodeUpper,
				dialCode: String( country[ libPhoneNumberIndexes.COUNTRY_DIAL_CODE ] + ( country[ libPhoneNumberIndexes.REGION_AREA_CODE ] || '' ) ),
				countryDialCode: String( country[ libPhoneNumberIndexes.COUNTRY_DIAL_CODE ] ),
				regionCode: country[ libPhoneNumberIndexes.REGION_AREA_CODE ] || '',
				areaCodes: areaCodes[ countryCode ],
				nationalPrefix: country[ libPhoneNumberIndexes.NATIONAL_PREFIX ],
				patterns: ( country[ libPhoneNumberIndexes.NUMBER_FORMAT ] || [] ).map( processNumberFormat ),
				internationalPatterns: ( country[ libPhoneNumberIndexes.INTERNATIONAL_NUMBER_FORMAT ] || [] ).map( processNumberFormat ),
				priority: priorityData[ countryCodeUpper ]
			};
		}
	}

	var noPattern = _.filter( data, _.conforms( { patterns: function( patterns ) { return patterns.length === 0 } } ) );
	forIn( noPattern, function( country ) {
		country.patternRegion = ( _.maxBy( _.values( _.filter( data, _.conforms( { dialCode: function ( d ) { return d === country.dialCode } } ) ) ), 'priority' ) || {} ).isoCode;
		console.log( 'Info: ' + country.isoCode + ' didn\'t have a pattern' + ( country.patternRegion ? ' so we use ' + country.patternRegion : '.' ) );
	} );
	return data;
}

// Political correction
function injectHardCodedValues( libPhoneNumberData ) {
	return Object.assign( {}, {
		KV: {
			isoCode: 'KV',
			dialCode: '383',
			nationalPrefix: '0',
			priority: priorityData.KV
		},
		UM: {
			isoCode: 'UM',
			dialCode: '1',
			nationalPrefix: '',
			patternRegion: 'us',
			priority: priorityData.UM
		},
		BV: {
			isoCode: 'BV',
			dialCode: '47',
			nationalPrefix: '',
			priority: priorityData.BV
		},
		TF: {
			isoCode: 'TF',
			dialCode: '262',
			nationalPrefix: '0',
			priority: priorityData.TF
		},
		HM: {
			isoCode: 'HM',
			dialCode: '61',
			nationalPrefix: '0',
			priority: priorityData.HM
		},
		PN: {
			isoCode: 'PN',
			dialCode: '64',
			nationalPrefix: '0',
			priority: priorityData.PN
		},
		GS: {
			isoCode: 'GS',
			nationalPrefix: '',
			dialCode: '500',
			priority: priorityData.GS
		}
	}, libPhoneNumberData );
}

/**
 * Creates aliases. E.g. allows `uk` to be found by both `gb` and `uk`.
 * @param data
 */
function insertCountryAliases( data ) {
	Object.keys( aliases ).forEach( source => {
		data[ source ] = data[ aliases[ source ] ];
	} );
	return data;
}

/**
 * Wraps and saves data to '../client/components/phone-input/data.js'
 * @param {Object} data
 */
function saveToFile( data ) {
	var scriptStr = (
		'/** @format */\n' +
		'// Generated by build-metadata.js\n' +
		'/* eslint-disable */\n' +
		Object
			.keys( data )
			.map( key => `export const ${ key } = ${ JSON.stringify( data[ key ], null, 3 ) };\n` )
			.join( '\n' ) +
		'/* eslint-enable */\n'
	);
	var filePath = path.resolve( __dirname, '..', 'client', 'components', 'phone-input', 'data.js' );
	fs.writeFileSync( filePath, scriptStr );
}

function generateDialCodeMap( metadata ) {
	var res = {};
	function addValue( key, value ) {
		if ( ! /^\d+$/.test( key ) ) {
			console.warn( 'Warning: ' + value + ' has invalid dialCode: ' + key );
			return;
		}
		res[ key ] = res[ key ] || [];
		if ( ! includes( res[ key ], value ) ) {
			res[ key ].push( value );
		}
	}
	forIn( metadata, function( country ) {
		addValue( country.dialCode, country.isoCode );
		( country.areaCodes || [] ).forEach( function( areaCode ) { addValue( country.dialCode + areaCode, country.isoCode ) } );
	} );

	return mapValues( res, function ( countryCodes ) {
		return orderBy( countryCodes, function( countryCode ) { return metadata[ countryCode ].priority || 0 }, 'desc' );
	} );
}

function generateFullDataset( metadata ) {
	return {
		countries: metadata,
		dialCodeMap: generateDialCodeMap( metadata )
	};
}

getLibPhoneNumberData()
	.then( processLibPhoneNumberMetadata )
	.then( injectHardCodedValues )
	.then( generateDeepRemoveEmptyArraysFromObject( [ 'patterns', 'internationalPatterns' ] ) )
	.then( insertCountryAliases )
	.then( removeAllNumberKeys )
	.then( removeRegionCodeAndCountryDialCodeIfSameWithCountryDialCode )
	.then( generateFullDataset )
	.then( deepRemoveUndefinedKeysFromObject )
	.then( saveToFile )
	.catch( function( error ) {
		console.error( error.stack );
		process.exit( -1 );
} );
