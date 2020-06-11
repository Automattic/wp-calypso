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
	const { borderRadius, text } = attributes;
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
