/** @format */

/**
 * External dependencies
 */
import { RawHTML } from '@wordpress/element';

export default function Save( { attributes } ) {
	const { show_subscribers_total } = attributes;
	return (
		<RawHTML
		>{ `[jetpack_subscription_form show_subscribers_total="${ show_subscribers_total }"]` }</RawHTML>
	);
}
