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
	us: 10,
	ca: 5,
	'do': 3,
	pr: 1,
	// dial code: +7
	ru: 10,
	kz: 1,
	// dial code: +39
	it: 10,
	va: 1,
	// dial code: +44
	gb: 10,
	je: 5,
	im: 3,
	gg: 1,
	// dial code: +47
	no: 10,
	sj: 1,
	// dial code: +61
	au: 10,
	cx: 5,
	cc: 1,
	// dial code: +290
	sh: 10,
	ta: 1,
	// dial code: +358
	fi: 10,
	ax: 1,
	// dial code: +590
	gp: 10,
	mf: 5,
	bl: 1,
	// dial code: +599
	cw: 10,
	bq: 1
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
	NATIONAL_CALLING_FORMAT: 4
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
		nationalFormat: format.length > numberFormatIndexes.NATIONAL_CALLING_FORMAT && format[ numberFormatIndexes.NATIONAL_CALLING_FORMAT ] || undefined
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

/**
 * Processes Google's libphonenumber data and generates a proper JS object
 * @param {{}} libPhoneNumberData
 * @returns {{}}
 */
function processLibPhoneNumberMetadata( libPhoneNumberData ) {
	var data = {};
	for ( var countryCode in libPhoneNumberData ) {
		if ( libPhoneNumberData.hasOwnProperty( countryCode ) ) {
			var countryCodeLower = countryCode.toLowerCase();
			var country = libPhoneNumberData[ countryCode ];
			data[ countryCodeLower ] = {
				isoCode: countryCodeLower,
				dialCode: String( country[ libPhoneNumberIndexes.COUNTRY_DIAL_CODE ] + ( country[ libPhoneNumberIndexes.REGION_AREA_CODE ] || '' ) ),
				areaCodes: areaCodes[ countryCode ],
				nationalPrefix: country[ libPhoneNumberIndexes.NATIONAL_PREFIX ],
				patterns: ( country[ libPhoneNumberIndexes.NUMBER_FORMAT ] || [] ).map( processNumberFormat ),
				internationalPatterns: ( country[ libPhoneNumberIndexes.INTERNATIONAL_NUMBER_FORMAT ] || [] ).map( processNumberFormat ),
				priority: priorityData[ countryCodeLower ]
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

/**
 * Converts a given object to a JS string, then compiles and executes the given string and compares the two with deep
 * equality. If they are deeply equal, returns the JS string.
 * @param {{}} data
 * @returns {string}
 */
function convertToJSStringAndVerify( data ) {
	const dataString = toJSString( data );
	const parsedData = parseJSStringToData( dataString );
	assert.deepEqual( parsedData , data );
	return dataString;
}

/**
 * Wraps and saves a given JS string to '../client/components/phone-input/data.js'
 * @param dataString
 */
function saveToFile( dataString ) {
	var scriptStr = '// Generated by build-metadata.js\n/* eslint-disable */\nmodule.exports = ' + dataString + ';\n/* eslint-enable */\n';
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
		res[ key ].push( value );
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
	.then( generateDeepRemoveEmptyArraysFromObject( [ 'patterns', 'internationalPatterns' ] ) )
	.then( removeAllNumberKeys )
	.then( generateFullDataset )
	.then( deepRemoveUndefinedKeysFromObject )
	.then( convertToJSStringAndVerify )
	.then( saveToFile )
	.catch( function( error ) {
		console.error( error.stack );
		process.exit( -1 );
} );
