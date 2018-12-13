/** @format */

/**
 * External dependencies
 */
import { RawHTML } from '@wordpress/element';

export default function Save( { attributes } ) {
	const { show_subscribers_total } = attributes;
	return (
		<RawHTML
		>{ `[jetpack_subscription_form title="" subscribe_text="" show_subscribers_total="${ show_subscribers_total }"]` }</RawHTML>
	);
}
