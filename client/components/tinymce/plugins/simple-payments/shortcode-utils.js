/**
 * External dependencies
 */
import { get } from 'lodash';

/**
 * Internal dependencies
 */
import Shortcode from 'lib/shortcode';

/**
 * Returns Simple Payments' shortcode data in an object.
 *
 * @param {string} shortcode Simple Payments shortcode (e.g. [simple-payment id="20"])
 * @returns {object} Returns an object containing shortcode data.
 */
export function deserialize( shortcode ) {
	if ( ! shortcode ) {
		return null;
	}

	const parsed = Shortcode.parse( shortcode );

	const shortcodeData = {};

	const simplePaymentId = parseInt( get( parsed, 'attrs.named.id', null ) );

	shortcodeData.id = isNaN( simplePaymentId ) ? null : simplePaymentId;

	return shortcodeData;
}
