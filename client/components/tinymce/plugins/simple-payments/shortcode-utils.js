/** @format */
/**
 * External dependencies
 */
import { get } from 'lodash';

/**
 * Internal dependencies
 */
import { parse, stringify } from 'lib/shortcode';

/**
 * Serializes shortcode data (object with id property) to a Simple Payments shortcode.
 * @returns {string} Serialized shortcode, e.g., `[simple-payment id="1"]`
 */
export function serialize( { id, isMembership } ) {
	if ( isMembership ) {
		return stringify( {
			tag: 'membership',
			type: 'single',
			attrs: { id },
		} );
	}
	return stringify( {
		tag: 'simple-payment',
		type: 'single',
		attrs: { id },
	} );
}

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

	const parsed = parse( shortcode );

	const shortcodeData = {};

	const simplePaymentId = parseInt( get( parsed, 'attrs.named.id', null ) );

	shortcodeData.id = isNaN( simplePaymentId ) ? null : simplePaymentId;

	return shortcodeData;
}
