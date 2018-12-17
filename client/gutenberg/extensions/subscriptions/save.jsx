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

	const buttonStyle = {
		backgroundColor: backgroundClass ? undefined : customBackgroundColor,
		color: textClass ? undefined : customTextColor,
	};

	// TODO: Funnel buttonClasses and buttonStyle into the
	// jetpack_subscription_form shortcode via Jetpack

	return (
		<RawHTML>
			{ `[jetpack_subscription_form show_subscribers_total="${ showSubscribersTotal }" show_only_email_and_button="true"]` }
		</RawHTML>
	);
}
