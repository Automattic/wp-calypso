/**
 * External dependencies
 */
import { RawHTML } from '@wordpress/element';

export default function Save( { attributes } ) {
	const {
		showSubscribersTotal,
		submitButtonClasses,
		customBackgroundButtonColor,
		customTextButtonColor,
		submitButtonText,
	} = attributes;
	return (
		<RawHTML>{ `[jetpack_subscription_form show_only_email_and_button="true" custom_background_button_color="${ customBackgroundButtonColor }" custom_text_button_color="${ customTextButtonColor }" submit_button_text="${ submitButtonText }" submit_button_classes="${ submitButtonClasses }" show_subscribers_total="${ showSubscribersTotal }" ]` }</RawHTML>
	);
}
