/**
 * External dependencies
 */
import classnames from 'classnames';
import { RawHTML } from '@wordpress/element';
import { getColorClassName } from '@wordpress/editor';

export default function save( { attributes } ) {
	const {
		showSubscribersTotal,
		backgroundColor,
		textColor,
		customBackgroundColor,
		customTextColor,
	} = attributes;

	const textClass = getColorClassName( 'color', textColor );
	const backgroundClass = getColorClassName( 'background-color', backgroundColor );

	const buttonClasses = classnames( 'wp-block-button__link', {
		'has-text-color': textColor || customTextColor,
		[ textClass ]: textClass,
		'has-background': backgroundColor || customBackgroundColor,
		[ backgroundClass ]: backgroundClass,
	} );

	const buttonBackgroundColor = backgroundClass ? '' : customBackgroundColor;
	const buttonTextColor = textClass ? '' : customTextColor;

	return (
		<RawHTML>
			{ `[jetpack_subscription_form button_classes="${ buttonClasses }" button_background_color="${ buttonBackgroundColor }" button_text_color="${ buttonTextColor }" show_subscribers_total="${ showSubscribersTotal }" show_only_email_and_button="true"]` }
		</RawHTML>
	);
}
