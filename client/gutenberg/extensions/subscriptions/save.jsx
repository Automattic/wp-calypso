/**
 * External dependencies
 */
import { RawHTML } from '@wordpress/element';

export default function Save( { attributes } ) {
	const { showSubscribersTotal } = attributes;
	return (
		<RawHTML
		>{ `[jetpack_subscription_form show_subscribers_total="${ showSubscribersTotal }" show_only_email_and_button="true"]` }</RawHTML>
	);
}
