/**
 * Copyright 2017 The AMP HTML Authors. All Rights Reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS-IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

/**
 * Internal Dependencies
 */
import { parseUrl } from './utils/url';

const punycode = require( 'punycode' ); // eslint-disable-line import/no-nodejs-modules

/** @private {string} The default AMP cache prefix to be used. */
const DEFAULT_CACHE_AUTHORITY_ = 'cdn.ampproject.org';

/**
 * The default JavaScript version to be used for AMP viewer URLs.
 * @private {string}
 */
const DEFAULT_VIEWER_JS_VERSION_ = '0.1';

/** @type {string} */
const LTR_CHARS =
	'A-Za-z\u00C0-\u00D6\u00D8-\u00F6\u00F8-\u02B8\u0300-\u0590\u0800-\u1FFF' +
	'\u200E\u2C00-\uFB1C\uFE00-\uFE6F\uFEFD-\uFFFF';

/** @type {string} */
const RTL_CHARS =
	'\u0591-\u06EF\u06FA-\u07FF\u200F\uFB1D-\uFDFF\uFE70-\uFEFC';

/** @type {RegExp} */
const HAS_LTR_CHARS = new RegExp( '[' + LTR_CHARS + ']' );

/** @type {RegExp} */
const HAS_RTL_CHARS = new RegExp( '[' + RTL_CHARS + ']' );

/** @private {number} */
const MAX_DOMAIN_LABEL_LENGTH_ = 63;

/**
 * Constructs a Viewer cache url for native viers using these rules:
 * https://developers.google.com/amp/cache/overview
 *
 * Example:
 * Input url 'http://ampproject.org' can return
 * 'https://www-ampproject-org.cdn.ampproject.org/v/s/www.ampproject.org/?amp_js_v=0.1#origin=http%3A%2F%2Flocalhost%3A8000'
 *
 * @param {string} url The complete publisher url.
 * @param {object} initParams Params containing origin, etc.
 * @param {string} opt_cacheUrlAuthority The cache URL authority
 * @param {string} opt_viewerJsVersion The viewer JS version
 * @return {!Promise<string>} Viewer URL promise
 * @private
 */
export function constructNativeViewerCacheUrl( url, initParams,	opt_cacheUrlAuthority, opt_viewerJsVersion ) {
	return constructViewerCacheUrlOptions( url, true, initParams, opt_cacheUrlAuthority, opt_viewerJsVersion );
}

/**
 * Constructs a Viewer cache url using these rules:
 * https://developers.google.com/amp/cache/overview
 *
 * Example:
 * Input url 'http://ampproject.org' can return
 * 'https://www-ampproject-org.cdn.ampproject.org/v/s/www.ampproject.org/?amp_js_v=0.1#origin=http%3A%2F%2Flocalhost%3A8000'
 *
 * @param {string} url The complete publisher url.
 * @param {object} initParams Params containing origin, etc.
 * @param {string} opt_cacheUrlAuthority The cache URL authority
 * @param {string} opt_viewerJsVersion The viewer JS version
 * @return {!Promise<string>} The viewer cache URL promise
 * @private
 */
export function constructViewerCacheUrl( url, initParams, opt_cacheUrlAuthority, opt_viewerJsVersion ) {
	return constructViewerCacheUrlOptions( url, false, initParams, opt_cacheUrlAuthority, opt_viewerJsVersion );
}

/**
 * Constructs a Viewer cache url using these rules:
 * https://developers.google.com/amp/cache/overview
 *
 * Example:
 * Input url 'http://ampproject.org' can return
 * 'https://www-ampproject-org.cdn.ampproject.org/v/s/www.ampproject.org/?amp_js_v=0.1#origin=http%3A%2F%2Flocalhost%3A8000'
 *
 * @param {string} url The complete publisher url.
 * @param {boolean} isNative Whether or not the url generated follows rules for native viewers (like AMPKit)
 * @param {object} initParams Params containing origin, etc.
 * @param {string} opt_cacheUrlAuthority The cache URL authority
 * @param {string} opt_viewerJsVersion The viewer JS version
 * @return {!Promise<string>} The viewer cache URL promise
 * @private
 */
function constructViewerCacheUrlOptions( url, isNative, initParams,
		opt_cacheUrlAuthority, opt_viewerJsVersion ) {
	const parsedUrl = parseUrl( url );
	const protocolStr = parsedUrl.protocol === 'https:' ? 's/' : '';
	const viewerJsVersion = opt_viewerJsVersion ? opt_viewerJsVersion : DEFAULT_VIEWER_JS_VERSION_;
	const search = parsedUrl.search ? parsedUrl.search + '&' : '?';
	const pathType = isNative ? '/c/' : '/v/';
	const ampJSVersion = isNative ? '' : 'amp_js_v=' + viewerJsVersion;

	return new Promise( resolve => {
		constructCacheDomainUrl_( parsedUrl.host, opt_cacheUrlAuthority ).then( cacheDomain => {
			resolve(
				'https://' +
				cacheDomain +
				pathType +
				protocolStr +
				parsedUrl.host +
				parsedUrl.pathname +
				search +
				ampJSVersion +
				'#' +
				paramsToString_( initParams )
			);
		} );
	} );
}

/**
 * Constructs a cache domain url. For example:
 *
 * Input url 'http://ampproject.org'
 * will return  'https://www-ampproject-org.cdn.ampproject.org'
 *
 * @param {string} url The complete publisher url.
 * @param {string} opt_cacheUrlAuthority The cache URL authority
 * @return {!Promise<string>} The cache domain URL promise
 * @private
 */
function constructCacheDomainUrl_( url, opt_cacheUrlAuthority ) {
	return new Promise( resolve => {
		const cacheUrlAuthority =
			opt_cacheUrlAuthority ? opt_cacheUrlAuthority : DEFAULT_CACHE_AUTHORITY_;
		constructCacheDomain_( url ).then( cacheDomain => {
			resolve( cacheDomain + '.' + cacheUrlAuthority );
		} );
	} );
}

/**
 * Constructs a curls domain following these instructions:
 * 1. Convert pub.com from IDN (punycode) to utf-8, if applicable.
 * 2. Replace every “-” with “--”.
 * 3. Replace each “.” with “-”.
 * 4. Convert back to IDN.
 *
 * Examples:
 *   'something.com'    =>  'something-com'
 *   'SOMETHING.COM'    =>  'something-com'
 *   'hello-world.com'  =>  'hello--world-com'
 *   'hello--world.com' =>  'hello----world-com'
 *
 * Fallback applies to the following cases:
 * - RFCs don’t permit a domain label to exceed 63 characters.
 * - RFCs don’t permit any domain label to contain a mix of right-to-left and
 *   left-to-right characters.
 * - If the origin domain contains no “.” character.
 *
 * Fallback Algorithm:
 * 1. Take the SHA256 of the punycode view of the domain.
 * 2. Base32 encode the resulting hash. Set the domain prefix to the resulting
 *    string.
 *
 * @param {string} url The complete publisher url.
 * @return {!Promise<string>} The curls encoded domain.
 * @private
 */
export function constructCacheDomain_( url ) {
	return new Promise( resolve => {
		if ( isEligibleForHumanReadableCacheEncoding_( url ) ) {
			const curlsEncoding = constructHumanReadableCurlsCacheDomain_( url );
			if ( curlsEncoding.length > MAX_DOMAIN_LABEL_LENGTH_ ) {
				constructFallbackCurlsCacheDomain_( url ).then( resolve );
			} else {
				resolve( curlsEncoding );
			}
		} else {
			constructFallbackCurlsCacheDomain_( url ).then( resolve );
		}
	} );
}

/**
 * Determines whether the given domain can be validly encoded into a human
 * readable curls encoded cache domain.  A domain is eligible as long as:
 *   It does not exceed 63 characters
 *   It does not contain a mix of right-to-left and left-to-right characters
 *   It contains a dot character
 *
 * @param {string} domain The domain to validate
 * @return {boolean} Whether the domain is eligible for human readable encoding
 * @private
 */
function isEligibleForHumanReadableCacheEncoding_( domain ) {
	const unicode = punycode.toUnicode( domain );
	return domain.length <= MAX_DOMAIN_LABEL_LENGTH_ &&
			! ( HAS_LTR_CHARS.test( unicode ) &&
				HAS_RTL_CHARS.test( unicode ) ) &&
			domain.indexOf( '.' ) !== -1;
}

/**
 * Constructs a human readable curls encoded cache domain using the following
 * algorithm:
 *   Convert domain from punycode to utf-8 (if applicable)
 *   Replace every '-' with '--'
 *   Replace every '.' with '-'
 *   Convert back to punycode (if applicable)
 *
 * @param {string} domain The publisher domain
 * @return {string} The curls encoded domain
 * @private
 */
function constructHumanReadableCurlsCacheDomain_( domain ) {
	domain = punycode.toUnicode( domain );
	domain = domain.split( '-' ).join( '--' );
	domain = domain.split( '.' ).join( '-' );
	return punycode.toASCII( domain ).toLowerCase();
}

/**
 * Constructs a fallback curls encoded cache domain by taking the SHA256 of
 * the domain and base32 encoding it.
 *
 * @param {string} domain The publisher domain
 * @return {!Promise<string>} A promise that resolves whether to construct fallback curls for the cache domain
 * @private
 */
function constructFallbackCurlsCacheDomain_( domain ) {
	return new Promise( resolve => {
		sha256_( domain ).then( digest => {
			resolve( encodeHexToBase32_( digest ) );
		} );
	} );
}

/**
 * @param {string} str The string to convert to sha256
 * @return {!Promise<string>} A promise that resolves to sha of the string
 * @private
 */
function sha256_( str ) {
	// Transform the string into an arraybuffer.
	const buffer = new TextEncoder( 'utf-8' ).encode( str );
	return crypto.subtle.digest( 'SHA-256', buffer ).then( hash => {
		return hex_( hash );
	} );
}

/**
 * @param {string} buffer The buffer to be encoded
 * @return {string} The encoded buffer
 * @private
 */
function hex_( buffer ) {
	const hexCodes = [];
	const view = new DataView( buffer );
	for ( let i = 0; i < view.byteLength; i += 4 ) {
		// Using getUint32 reduces the number of iterations needed (we process 4 bytes each time)
		const value = view.getUint32( i );
		// toString(16) will give the hex representation of the number without padding
		const stringValue = value.toString( 16 );
		// Use concatenation and slice for padding
		const padding = '00000000';
		const paddedValue = ( padding + stringValue ).slice( -padding.length );
		hexCodes.push( paddedValue );
	}

	// Join all the hex strings into one
	return hexCodes.join( '' );
}

/**
 * Takes an object such as:
 * {
 *   origin: "http://localhost:8000",
 *   prerenderSize: 1
 * }
 * and converts it to: "origin=http%3A%2F%2Flocalhost%3A8000&prerenderSize=1"
 *
 * @param {object} params Params to encode as a string
 * @return {string} The params as a string
 * @private
 */
function paramsToString_( params ) {
	let str = '';
	for ( const key in params ) {
		const value = params[ key ];
		if ( value === null || value === undefined ) {
			continue;
		}
		if ( str.length > 0 ) {
			str += '&';
		}
		str += encodeURIComponent( key ) + '=' + encodeURIComponent( value );
	}
	return str;
}

 /**
	 * Encodes a hex string in base 32 according to specs in RFC 4648 section 6:
	 * https://tools.ietf.org/html/rfc4648
	 *
	 * @param {string} hexString The hex string
	 * @return {string} The base32 encoded string
	 * @private
	 */
function encodeHexToBase32_( hexString ) {
	const initialPadding = 'ffffffffff';
	const finalPadding = '000000';
	const paddedHexString = initialPadding + hexString + finalPadding;
	const encodedString = encode32_( paddedHexString );

	const bitsPerHexChar = 4;
	const bitsPerBase32Char = 5;
	const numInitialPaddingChars =
			initialPadding.length * bitsPerHexChar / bitsPerBase32Char;
	const numHexStringChars =
			Math.ceil( hexString.length * bitsPerHexChar / bitsPerBase32Char );

	return encodedString.substr( numInitialPaddingChars, numHexStringChars );
}

/**
 * We use the base32 character encoding defined here:
 * https://tools.ietf.org/html/rfc4648#page-8
 *
 * @param {string} paddedHexString A padded hex string
 * @return {string} the base32 string
 * @private
 */
function encode32_( paddedHexString ) {
	let bytes = [];
	paddedHexString.match( /.{1,2}/g ).forEach( ( pair, i ) => {
		bytes[ i ] = parseInt( pair, 16 );
	} );

	// Split into groups of 5 and convert to base32.
	const base32 = 'abcdefghijklmnopqrstuvwxyz234567';
	const leftover = bytes.length % 5;
	let quanta = Math.floor( ( bytes.length / 5 ) );
	const parts = [];

	if ( leftover !== 0 ) {
		for ( let i = 0; i < ( 5 - leftover ); i++ ) {
			bytes += '\x00';
		}
		quanta += 1;
	}

	for ( let i = 0; i < quanta; i++ ) {
		parts.push( base32.charAt( bytes[ i * 5 ] >> 3 ) );
		parts.push( base32.charAt( ( ( bytes[ i * 5 ] & 0x07 ) << 2 ) | ( bytes[ i * 5 + 1 ] >> 6 ) ) );
		parts.push( base32.charAt( ( ( bytes[ i * 5 + 1 ] & 0x3F ) >> 1 ) ) );
		parts.push( base32.charAt( ( ( bytes[ i * 5 + 1 ] & 0x01 ) << 4 ) | ( bytes[ i * 5 + 2 ] >> 4 ) ) );
		parts.push( base32.charAt( ( ( bytes[ i * 5 + 2 ] & 0x0F ) << 1 ) | ( bytes[ i * 5 + 3 ] >> 7 ) ) );
		parts.push( base32.charAt( ( ( bytes[ i * 5 + 3 ] & 0x7F ) >> 2 ) ) );
		parts.push( base32.charAt( ( ( bytes[ i * 5 + 3 ] & 0x03 ) << 3 ) | ( bytes[ i * 5 + 4 ] >> 5 ) ) );
		parts.push( base32.charAt( ( ( bytes[ i * 5 + 4 ] & 0x1F ) ) ) );
	}

	let replace = 0;
	if ( leftover === 1 ) {
		replace = 6;
	} else if ( leftover === 2 ) {
		replace = 4;
	} else if ( leftover === 3 ) {
		replace = 3;
	} else if ( leftover === 4 ) {
		replace = 1;
	}

	for ( let i = 0; i < replace; i++ ) {
		parts.pop();
	}
	for ( let i = 0; i < replace; i++ ) {
		parts.push( '=' );
	}

	return parts.join( '' );
}
