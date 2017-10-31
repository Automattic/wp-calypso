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
