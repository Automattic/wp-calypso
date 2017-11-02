/**
 * External dependencies
 *
 * @format
 */
import includes from 'lodash/includes';

/**
 * Internal dependencies
 */
import config from 'config';
import {
	PAYMENT_PROCESSOR_EBANX_COUNTRY_CODES
} from './constants';

/**
 *
 * @param {string} countryCode - a two-letter country code, e.g., 'DE', 'BR'
 * @returns {bool} Whether the country code requires ebanx payement processing
 */
export function isEbanx( countryCode = '' ) {
	return includes( PAYMENT_PROCESSOR_EBANX_COUNTRY_CODES, countryCode ) && config.isEnabled( 'upgrades/ebanx' );
}

/**
 *
 * @param {string} cpf - a Brazilian tax identification number
 * @returns {bool} Whether the cpf is valid or not
 */
// lifted from here with some mods: http://www.geradorcpf.com/algoritmo_do_cpf.htm
// TODO: elaborate, review and clean up
export function isValidCPF( cpf = '' ) {
	cpf = cpf.replace( /([~!@#$%^&*()_+=`{}\[\]\-|\\:;'<>,.\/? ])+/g, '' );

	if ( ! cpf ) {
		return false;
	}

	if ( cpf.length !== 11 ||
		cpf === '00000000000' ||
		cpf === '11111111111' ||
		cpf === '22222222222' ||
		cpf === '33333333333' ||
		cpf === '44444444444' ||
		cpf === '55555555555' ||
		cpf === '66666666666' ||
		cpf === '77777777777' ||
		cpf === '88888888888' ||
		cpf === '99999999999' ) {
		return false;
	}

	let sum = 0;

	for ( let i = 0; i < 9; i++ ) {
		sum += parseInt( cpf.charAt( i ) ) * ( 10 - i );
	}

	let rev = 11 - ( sum % 11 );

	if ( rev === 10 || rev === 11 ) {
		rev = 0;
	}

	if ( rev !== parseInt( cpf.charAt( 9 ) ) ) {
		return false;
	}

	sum = 0;
	for ( let i = 0; i < 10; i++ ) {
		sum += parseInt( cpf.charAt( i ) ) * ( 11 - i );
	}

	rev = 11 - ( sum % 11 );
	if ( rev === 10 || rev === 11 ) {
		rev = 0;
	}

	if ( rev !== parseInt( cpf.charAt( 10 ) ) ) {
		return false;
	}
	return true;
}
