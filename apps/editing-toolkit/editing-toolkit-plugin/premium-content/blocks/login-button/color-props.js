// The code in this file is copied entirely from https://github.com/WordPress/gutenberg/blob/HEAD/packages/block-library/src/button/color-props.js
/* eslint-disable */

/**
 * External dependencies
 */
import classnames from 'classnames';

/**
 * WordPress dependencies
 */
import { getColorClassName, __experimentalGetGradientClass } from '@wordpress/block-editor';

export default function getColorAndStyleProps( attributes ) {
	// I'd have prefered to avoid the "style" attribute usage here
	const { backgroundColor, textColor, gradient, style } = attributes;

	const backgroundClass = getColorClassName( 'background-color', backgroundColor );
	const gradientClass = __experimentalGetGradientClass( gradient );
	const textClass = getColorClassName( 'color', textColor );
	const className = classnames( textClass, gradientClass, {
		// Don't apply the background class if there's a custom gradient
		[ backgroundClass ]: ! style?.color?.gradient && !! backgroundClass,
		'has-text-color': textColor || style?.color?.text,
		'has-background':
			backgroundColor || style?.color?.background || gradient || style?.color?.gradient,
	} );
	const styleProp =
		style?.color?.background || style?.color?.text || style?.color?.gradient
			? {
					background: style?.color?.gradient ? style.color.gradient : undefined,
					backgroundColor: style?.color?.background ? style.color.background : undefined,
					color: style?.color?.text ? style.color.text : undefined,
			  }
			: {};

	return {
		className: !! className ? className : undefined,
		style: styleProp,
	};
}
