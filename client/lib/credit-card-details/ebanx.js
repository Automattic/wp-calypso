/**
 * External dependencies
 *
 * @format
 */
import isUndefined from 'lodash/isUndefined';
import isString from 'lodash/isString';

/**
 * Internal dependencies
 */
import config from 'config';
import { PAYMENT_PROCESSOR_EBANX_COUNTRIES } from './constants';

/**
 *
 * @param {string} countryCode - a two-letter country code, e.g., 'DE', 'BR'
 * @returns {bool} Whether the country code requires ebanx payement processing
 */
export function isEbanx( countryCode = '' ) {
	return (
		! isUndefined( PAYMENT_PROCESSOR_EBANX_COUNTRIES[ countryCode ] ) &&
		config.isEnabled( 'upgrades/ebanx' )
	);
}

/**
 * CPF number (Cadastrado de Pessoas Físicas) is the Brazilian tax identification number.
 * Total of 11 digits: 9 numbers followed by 2 verification numbers . E.g., 188.247.019-22
 * The following test is a weak test only. Full algorithm here: http://www.geradorcpf.com/algoritmo_do_cpf.htm
 *
 * See: http://www.geradorcpf.com/algoritmo_do_cpf.htm
 * @param {string} cpf - a Brazilian tax identification number
 * @returns {bool} Whether the cpf is valid or not
 */

export function isValidCPF( cpf = '' ) {
	return isString( cpf ) && /^[0-9]{3}\.[0-9]{3}\.[0-9]{3}-[0-9]{2}$/.test( cpf );
}
