/** @format */
/**
 * External dependencies
 */
import classnames from 'classnames';
import { Fragment } from '@wordpress/element';
import { compose } from '@wordpress/compose';
import { withFallbackStyles } from '@wordpress/components';
import {
	InspectorControls,
	PanelColorSettings,
	ContrastChecker,
	RichText,
	withColors,
	getColorClassName,
} from '@wordpress/editor';

/**
 * Internal dependencies
 */
import { __ } from 'gutenberg/extensions/presets/jetpack/utils/i18n';

const { getComputedStyle } = window;

const applyFallbackStyles = withFallbackStyles( ( node, ownProps ) => {
	const { textButtonColor, backgroundButtonColor } = ownProps;
	const backgroundColorValue = backgroundButtonColor && backgroundButtonColor.color;
	const textColorValue = textButtonColor && textButtonColor.color;
	//avoid the use of querySelector if textColor color is known and verify if node is available.
	const textNode =
		! textColorValue && node ? node.querySelector( '[contenteditable="true"]' ) : null;
	const button = node.querySelector( '.wp-block-button__link' )
		? node.querySelector( '.wp-block-button__link' )
		: node;
	return {
		fallbackBackgroundColor:
			backgroundColorValue || ! node ? undefined : getComputedStyle( button ).backgroundColor,
		fallbackTextColor:
			textColorValue || ! textNode ? undefined : getComputedStyle( textNode ).color,
	};
} );

const SubmitButton = ( {
	attributes,
	textButtonColor,
	backgroundButtonColor,
	fallbackBackgroundColor,
	fallbackTextColor,
	setAttributes,
	setBackgroundButtonColor,
	setTextButtonColor,
} ) => {
	const textClass = getColorClassName( 'color', textButtonColor );
	const backgroundClass = getColorClassName( 'background-color', backgroundButtonColor );

	const buttonClasses = classnames( 'wp-block-button__link', {
		'has-text-color': textButtonColor,
		[ textClass ]: textClass,
		'has-background': backgroundButtonColor,
		[ backgroundClass ]: backgroundClass,
	} );

	const backgroundColor = attributes.customBackgroundButtonColor
		? attributes.customBackgroundButtonColor
		: fallbackBackgroundColor;
	const color = attributes.customTextButtonColor
		? attributes.customTextButtonColor
		: fallbackTextColor;

	const buttonStyle = { border: 'none', backgroundColor, color };

	return (
		<Fragment>
			<div className="wp-block-button jetpack-submit-button">
				<RichText
					placeholder={ __( 'Add text…' ) }
					value={ attributes.submitButtonText }
					onChange={ nextValue => setAttributes( { submitButtonText: nextValue } ) }
					className={ buttonClasses }
					style={ buttonStyle }
					keepPlaceholderOnFocus
				/>
			</div>
			<InspectorControls>
				<PanelColorSettings
					title={ __( 'Button Color Settings' ) }
					colorSettings={ [
						{
							value: backgroundColor,
							onChange: nextColour => {
								setBackgroundButtonColor( nextColour );
								setAttributes( { customBackgroundButtonColor: nextColour } );
							},
							label: __( 'Background Color' ),
						},
						{
							value: color,
							onChange: nextColour => {
								setTextButtonColor( nextColour );
								setAttributes( { customTextButtonColor: nextColour } );
							},
							label: __( 'Text Color' ),
						},
					] }
				/>
				<ContrastChecker
					// Text is considered large if font size is greater or equal to 18pt or 24px,
					// currently that's not the case for button.
					isLargeText={ false }
					textColor={ color }
					backgroundColor={ backgroundColor }
				/>
			</InspectorControls>
		</Fragment>
	);
};

export default compose( [
	withColors( 'backgroundButtonColor', { textButtonColor: 'color' } ),
	applyFallbackStyles,
] )( SubmitButton );
