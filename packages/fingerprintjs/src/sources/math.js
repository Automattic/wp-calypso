'use strict';
Object.defineProperty( exports, '__esModule', { value: true } );
var M = Math; // To reduce the minified code size
var fallbackFn = function () {
	return 0;
};
/**
 * @see https://gitlab.torproject.org/legacy/trac/-/issues/13018
 * @see https://bugzilla.mozilla.org/show_bug.cgi?id=531915
 */
function getMathFingerprint() {
	// Native operations
	var acos = M.acos || fallbackFn;
	var acosh = M.acosh || fallbackFn;
	var asin = M.asin || fallbackFn;
	var asinh = M.asinh || fallbackFn;
	var atanh = M.atanh || fallbackFn;
	var atan = M.atan || fallbackFn;
	var sin = M.sin || fallbackFn;
	var sinh = M.sinh || fallbackFn;
	var cos = M.cos || fallbackFn;
	var cosh = M.cosh || fallbackFn;
	var tan = M.tan || fallbackFn;
	var tanh = M.tanh || fallbackFn;
	var exp = M.exp || fallbackFn;
	var expm1 = M.expm1 || fallbackFn;
	var log1p = M.log1p || fallbackFn;
	// Operation polyfills
	var powPI = function ( value ) {
		return M.pow( M.PI, value );
	};
	var acoshPf = function ( value ) {
		return M.log( value + M.sqrt( value * value - 1 ) );
	};
	var asinhPf = function ( value ) {
		return M.log( value + M.sqrt( value * value + 1 ) );
	};
	var atanhPf = function ( value ) {
		return M.log( ( 1 + value ) / ( 1 - value ) ) / 2;
	};
	var sinhPf = function ( value ) {
		return M.exp( value ) - 1 / M.exp( value ) / 2;
	};
	var coshPf = function ( value ) {
		return ( M.exp( value ) + 1 / M.exp( value ) ) / 2;
	};
	var expm1Pf = function ( value ) {
		return M.exp( value ) - 1;
	};
	var tanhPf = function ( value ) {
		return ( M.exp( 2 * value ) - 1 ) / ( M.exp( 2 * value ) + 1 );
	};
	var log1pPf = function ( value ) {
		return M.log( 1 + value );
	};
	// Note: constant values are empirical
	return {
		acos: acos( 0.123124234234234242 ),
		acosh: acosh( 1e308 ),
		acoshPf: acoshPf( 1e154 ),
		asin: asin( 0.123124234234234242 ),
		asinh: asinh( 1 ),
		asinhPf: asinhPf( 1 ),
		atanh: atanh( 0.5 ),
		atanhPf: atanhPf( 0.5 ),
		atan: atan( 0.5 ),
		sin: sin( -1e300 ),
		sinh: sinh( 1 ),
		sinhPf: sinhPf( 1 ),
		cos: cos( 10.000000000123 ),
		cosh: cosh( 1 ),
		coshPf: coshPf( 1 ),
		tan: tan( -1e300 ),
		tanh: tanh( 1 ),
		tanhPf: tanhPf( 1 ),
		exp: exp( 1 ),
		expm1: expm1( 1 ),
		expm1Pf: expm1Pf( 1 ),
		log1p: log1p( 10 ),
		log1pPf: log1pPf( 10 ),
		powPI: powPI( -100 ),
	};
}
exports.default = getMathFingerprint;
