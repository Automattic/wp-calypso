/**
 * External dependencies
 */
import classnames from 'classnames';

/**
 * WordPress dependencies
 */
import { RichText } from '@wordpress/block-editor';

/**
 * Internal dependencies
 */
import getColorAndStyleProps from './color-props';

export default function save( { attributes } ) {
	const { borderRadius, text, type } = attributes;
	const colorProps = getColorAndStyleProps( attributes );
	const buttonClasses = classnames( 'wp-block-button__link', colorProps.className, {
		'no-border-radius': borderRadius === 0,
	} );
	const buttonStyle = {
		borderRadius: borderRadius ? borderRadius + 'px' : undefined,
		...colorProps.style,
	};
	return (
		// eslint-disable-next-line wpcalypso/jsx-classname-namespace
		<div
			className={ classnames( 'wp-block-button', {
				// `wp-block-jetpack-recurring-payments` ensures the subscribe dialog is opened in the same page using ThickBox.
				// @see https://github.com/Automattic/jetpack/blob/7f0f19e3c81a2aa677d6f159a6d889f403a18172/extensions/blocks/recurring-payments/view.js#L31-L43
				'wp-block-jetpack-recurring-payments': type === 'subscribe',
			} ) }
		>
			<RichText.Content
				tagName="a"
				className={ buttonClasses }
				style={ buttonStyle }
				value={ text }
			/>
		</div>
	);
}
