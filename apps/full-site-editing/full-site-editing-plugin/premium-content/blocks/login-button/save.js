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
		// `wp-block-premium-content-subscribe` ensures the subscribe dialog is opened in the same page using ThickBox.
		'wp-block-premium-content-button-subscribe': type === 'subscribe',
		'no-border-radius': borderRadius === 0,
	} );
	const buttonStyle = {
		borderRadius: borderRadius ? borderRadius + 'px' : undefined,
		...colorProps.style,
	};
	return (
		// eslint-disable-next-line wpcalypso/jsx-classname-namespace
		<div className="wp-block-button">
			<RichText.Content
				tagName="a"
				className={ buttonClasses }
				style={ buttonStyle }
				value={ text }
			/>
		</div>
	);
}
