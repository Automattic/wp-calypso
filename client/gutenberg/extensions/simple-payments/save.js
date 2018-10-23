/** @format */

/**
 * External dependencies
 */
import { RawHTML } from '@wordpress/element';

export default function Save( { attributes } ) {
	return (
		<RawHTML>
			[simple-payment id="
			{ attributes.paymentId }
			"]
		</RawHTML>
	);
}
