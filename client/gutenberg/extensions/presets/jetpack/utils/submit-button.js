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

const SubmitButton = props => {
	const {
		textButtonColor,
		backgroundButtonColor,
		fallbackBackgroundColor,
		fallbackTextColor,
		setAttributes,
		setBackgroundButtonColor,
		setTextButtonColor,
	} = props;
	const textClass = getColorClassName( 'color', textButtonColor );
	const backgroundClass = getColorClassName( 'background-color', backgroundButtonColor );

	const buttonClasses = classnames( 'wp-block-button__link', {
		'has-text-color': textButtonColor,
		[ textClass ]: textClass,
		'has-background': backgroundButtonColor,
		[ backgroundClass ]: backgroundClass,
	} );

	const buttonStyle = {
		border: 'none',
		backgroundColor: backgroundButtonColor.color
			? backgroundButtonColor.color
			: fallbackBackgroundColor,
		color: textButtonColor.color ? textButtonColor.color : fallbackTextColor,
	};

	return (
		<Fragment>
			<div class="wp-block-button jetpack-submit-button">
				<RichText
					placeholder={ __( 'Add text…' ) }
					value={ props.attributes.submitButtonText }
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
							value: '',
							onChange: nextColour => {
								setBackgroundButtonColor( nextColour );
							},
							label: __( 'Background Color' ),
						},
						{
							value: '',
							onChange: nextColour => {
								setTextButtonColor( nextColour );
							},
							label: __( 'Text Color' ),
						},
					] }
				/>
				<ContrastChecker
					{ ...{
						// Text is considered large if font size is greater or equal to 18pt or 24px,
						// currently that's not the case for button.
						isLargeText: false,
						textColor: textButtonColor.color,
						backgroundColor: backgroundButtonColor.color,
					} }
				/>
			</InspectorControls>
		</Fragment>
	);
};

// export default SubmitButton;

export default compose( [
	withColors( 'backgroundButtonColor', { textButtonColor: 'color' } ),
	applyFallbackStyles,
] )( SubmitButton );
