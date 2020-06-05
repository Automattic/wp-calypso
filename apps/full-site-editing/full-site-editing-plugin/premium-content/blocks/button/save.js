/**
 * External dependencies
 */
import classnames from 'classnames';

/**
 * WordPress dependencies
 */
import { RichText } from '@wordpress/block-editor';

export default function save( { attributes } ) {
	const { borderRadius, text, type } = attributes;
	const buttonClasses = classnames( 'wp-block-premium-content-button', 'wp-block-button__link', {
		// `wp-block-premium-content-subscribe` ensures the subscribe dialog is opened in the same page using ThickBox.
		'wp-block-premium-content-button-subscribe': type === 'subscribe',
		'no-border-radius': borderRadius === 0,
	} );
	const buttonStyle = {
		borderRadius: borderRadius ? borderRadius + 'px' : undefined,
	};
	return (
		<RichText.Content
			tagName="a"
			className={ buttonClasses }
			style={ buttonStyle }
			value={ text }
		/>
	);
}
