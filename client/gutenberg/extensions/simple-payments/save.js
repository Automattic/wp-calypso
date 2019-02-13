/**
 * External dependencies
 */
import { RawHTML } from '@wordpress/element';

export default function Save( { attributes } ) {
	const { productId } = attributes;
	return productId ? <RawHTML>{ `[simple-payment id="${ productId }"]` }</RawHTML> : null;
}
