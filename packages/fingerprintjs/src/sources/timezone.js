'use strict';
Object.defineProperty( exports, '__esModule', { value: true } );
var data_1 = require( '../utils/data' );
function getTimezone() {
	var _a;
	var DateTimeFormat = ( _a = window.Intl ) === null || _a === void 0 ? void 0 : _a.DateTimeFormat;
	if ( DateTimeFormat ) {
		var timezone = new DateTimeFormat().resolvedOptions().timeZone;
		if ( timezone ) {
			return timezone;
		}
	}
	// For browsers that don't support timezone names
	// The minus is intentional because the JS offset is opposite to the real offset
	var offset = -getTimezoneOffset();
	return 'UTC'.concat( offset >= 0 ? '+' : '' ).concat( Math.abs( offset ) );
}
exports.default = getTimezone;
function getTimezoneOffset() {
	var currentYear = new Date().getFullYear();
	// The timezone offset may change over time due to daylight saving time (DST) shifts.
	// The non-DST timezone offset is used as the result timezone offset.
	// Since the DST season differs in the northern and the southern hemispheres,
	// both January and July timezones offsets are considered.
	return Math.max(
		// `getTimezoneOffset` returns a number as a string in some unidentified cases
		( 0, data_1.toFloat )( new Date( currentYear, 0, 1 ).getTimezoneOffset() ),
		( 0, data_1.toFloat )( new Date( currentYear, 6, 1 ).getTimezoneOffset() )
	);
}
