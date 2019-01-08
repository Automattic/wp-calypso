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

	let textNode;
	let button;

	if ( ! textColorValue && node ) {
		textNode = node.querySelector( '[contenteditable="true"]' );
	}

	if ( node.querySelector( '.wp-block-button__link' ) ) {
		button = node.querySelector( '.wp-block-button__link' );
	} else {
		button = node;
	}

	let fallbackBackgroundColor;
	let fallbackTextColor;

	if ( node ) {
		fallbackBackgroundColor = getComputedStyle( button ).backgroundColor;
	}

	if ( textNode ) {
		fallbackTextColor = getComputedStyle( textNode ).color;
	}

	return {
		fallbackBackgroundColor: backgroundColorValue || fallbackBackgroundColor,
		fallbackTextColor: textColorValue || fallbackTextColor,
	};
} );

const SubmitButton = ( {
	attributes,
	textButtonColor,
	backgroundButtonColor,
	fallbackBackgroundColor,
	fallbackTextColor,
	setAttributes,
} ) => {
	const textClass = getColorClassName( 'color', textButtonColor );
	const backgroundClass = getColorClassName( 'background-color', backgroundButtonColor );

	const buttonClasses = classnames( 'wp-block-button__link', {
		'has-text-color': textButtonColor,
		[ textClass ]: textClass,
		'has-background': backgroundButtonColor,
		[ backgroundClass ]: backgroundClass,
	} );

	const backgroundColor = attributes.customBackgroundButtonColor || fallbackBackgroundColor;
	const color = attributes.customTextButtonColor || fallbackTextColor;

	const buttonStyle = { border: 'none', backgroundColor, color };

	setAttributes( { submitButtonClasses: buttonClasses } );
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
								setAttributes( { customBackgroundButtonColor: nextColour } );
							},
							label: __( 'Background Color' ),
						},
						{
							value: color,
							onChange: nextColour => {
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
