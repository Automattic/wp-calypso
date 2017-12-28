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
import { PAYMENT_PROCESSOR_EBANX_COUNTRIES } from './constants';
import { isEbanxEnabled } from 'lib/cart-values';
import CartStore from 'lib/cart/store';

/**
 *
 * @param {String} countryCode - a two-letter country code, e.g., 'DE', 'BR'
 * @returns {Boolean} Whether the country code requires ebanx payment processing
 */
export function isEbanxEnabledForCountry( countryCode = '' ) {
	return (
		! isUndefined( PAYMENT_PROCESSOR_EBANX_COUNTRIES[ countryCode ] ) &&
		isEbanxEnabled( CartStore.get() )
	);
}

/**
 * CPF number (Cadastrado de Pessoas Físicas) is the Brazilian tax identification number.
 * Total of 11 digits: 9 numbers followed by 2 verification numbers . E.g., 188.247.019-22
 * The following test is a weak test only. Full algorithm here: http://www.geradorcpf.com/algoritmo_do_cpf.htm
 *
 * See: http://www.geradorcpf.com/algoritmo_do_cpf.htm
 * @param {String} cpf - a Brazilian tax identification number
 * @returns {Boolean} Whether the cpf is valid or not
 */

export function isValidCPF( cpf = '' ) {
	return isString( cpf ) && /^[0-9]{3}\.[0-9]{3}\.[0-9]{3}-[0-9]{2}$/.test( cpf );
}
