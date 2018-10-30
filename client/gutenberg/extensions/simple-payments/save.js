/** @format */

/**
 * External dependencies
 */
import { RawHTML } from '@wordpress/element';

export default function Save( { attributes } ) {
	const { paymentId } = attributes;
	return paymentId ? <RawHTML>{ `[simple-payment id="${ paymentId }"]` }</RawHTML> : null;
}
