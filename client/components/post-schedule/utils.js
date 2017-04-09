/**
 * External dependencies
 */
import { moment } from 'i18n-calypso';

/**
 * Checks whether the passed time  format is of a 12-hour format.
 *
 * g - 12-hour format of an hour without leading zeros.
 * h - 12-hour format of an hour with leading zeros.
 * a - Lowercase Ante meridiem and Post meridiem.
 * A - Uppercase Ante meridiem and Post meridiem.
 *
 * @see https://wikipedia.org/wiki/12-hour_clock
 *
 * @param  {String}  timeFormat Time format.
 * @return {Boolean}            Whether it's a 12-hour time format.
 */
const is12hr = ( timeFormat ) => timeFormat && /[gh]|[aA]$/.test( timeFormat );

/**
 * Check whether is a valid gmtOffset value.
 * Basically it should be a number.
 *
 * @param  {*}  gmtOffset - gmt offset
 * @return {Boolean} is it a valid gtm offset?
 */
const isValidGMTOffset = gmtOffset => 'number' === typeof gmtOffset;

/**
 * Return localized date depending of given timezone or gmtOffset
 * parameters.
 *
 * @param {Moment} date - date instance
 * @param {String} tz - timezone
 * @param {Number} gmt - gmt offset in minutes
 * @return {Moment} localized date
 */
const getLocalizedDate = ( date, tz, gmt ) => {
	date = moment( date );

	if ( tz ) {
		date.tz( tz );
	} else if ( isValidGMTOffset( gmt ) ) {
		date.utcOffset( gmt );
	}

	return date;
};

const getDateInLocalUTC = date => moment( date.format ? date.format() : date );

const getTimeOffset = ( date, tz, gmt ) => {
	const userLocalDate = getDateInLocalUTC( date );
	const localizedDate = getLocalizedDate( date, tz, gmt );

	return userLocalDate.utcOffset() - localizedDate.utcOffset();
};

const convertDateToUserLocation = ( date, tz, gmt ) => {
	if ( ! ( tz || isValidGMTOffset( gmt ) ) ) {
		return moment( date );
	}

	return getDateInLocalUTC( date )
		.subtract( getTimeOffset( date, tz, gmt ), 'minute' );
};

const convertDateToGivenOffset = ( date, tz, gmt ) => {
	date = getLocalizedDate( date, tz, gmt )
		.add( getTimeOffset( date, tz, gmt ), 'minute' );

	if ( ! tz && isValidGMTOffset( gmt ) ) {
		date.utcOffset( gmt );
	}

	return date;
};

/**
 * Convert a number of minutes to the hh:mm format,
 * adding a `+` when the number is greater than zero,
 * not adding `:00` case (zero minutes).
 *
 * @param  {Number} minutes - a number of minutes
 * @return {String} `hh:mm` format
 */
const convertMinutesToHHMM = minutes => {
	const hours = Math.trunc( minutes / 60 );
	const sign = minutes > 0 ? '+' : '';

	if ( ! ( minutes / 60 % 1 ) ) {
		return sign + String( hours );
	}

	minutes = Math.abs( minutes % 60 );
	const mm = ( minutes < 10 ? ( '0' + minutes ) : minutes );

	return `${ sign }${ hours }:${ mm }`;
};

const convertHoursToHHMM = hours => convertMinutesToHHMM( hours * 60 );

/**
 * Check if the given value is useful to be assigned like hours or minutes.
 * This function has been thought to get the data entered
 * by the used through of an input element.
 *
 * @param {String} value - time value to check
 * @return {Number|Boolean} valid number or `false`
 */
const parseAndValidateNumber = value => {
	value = String( value );
	if ( value !== '0' && value !== '00' && ( value[ 0 ] === '0' || Number( value ) > 99 ) ) {
		value = Number( value.substr( 1 ) );
	}

	if ( ! ( isNaN( Number( value ) ) || Number( value ) < 0 || value.length > 2 ) ) {
		return Number( value );
	}

	return false;
};

export default {
	convertDateToGivenOffset,
	convertDateToUserLocation,
	convertHoursToHHMM,
	convertMinutesToHHMM,
	getDateInLocalUTC,
	getLocalizedDate,
	getTimeOffset,
	is12hr,
	isValidGMTOffset,
	parseAndValidateNumber,
};
