/**
 * External dependencies
 */
import { __ } from '@wordpress/i18n';
import classnames from 'classnames';
import { useEffect } from '@wordpress/element';
import { compose } from '@wordpress/compose';
import { withFallbackStyles } from '@wordpress/components';
import {
	InspectorControls,
	PanelColorSettings,
	ContrastChecker,
	RichText,
	withColors,
} from '@wordpress/block-editor';
import { get } from 'lodash';

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

	if ( node && button ) {
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

/**
 * Block edit function
 *
 * @typedef { import('@wordpress/block-editor').ColorPalette.Color } Color
 * @property { string } class
 * @property { string } color
 * @property { string } name
 * @property { string } slug
 *
 * @typedef { import('./').Attributes } Attributes
 * @typedef { Object } Props
 * @property { Color } backgroundButtonColor
 * @property { Color } textButtonColor
 * @property { string } fallbackBackgroundColor
 * @property { string } fallbackTextColor
 * @property { Attributes } attributes
 * @property { () => void } setBackgroundButtonColor
 * @property { () => void } setTextButtonColor
 * @property { (attributes: Partial<Attributes>) => void } setAttributes
 *
 * @param { Props } props
 */
function SubmitButtons( props ) {
	useEffect( () => {
		setButtonClasses();
		setCustomButtonColors();
	}, [ props.backgroundButtonColor, props.textButtonColor ] );

	function setButtonClasses() {
		const buttonClasses = getButtonClasses();
		props.setAttributes( { buttonClasses } );
	}

	function setCustomButtonColors() {
		const customTextButtonColor = getTextButtonColor();
		const customBackgroundButtonColor = getBackgroundButtonColor();

		if ( customTextButtonColor !== undefined ) {
			props.setAttributes( { customTextButtonColor } );
		}

		if ( customBackgroundButtonColor !== undefined ) {
			props.setAttributes( { customBackgroundButtonColor } );
		}
	}

	function getTextButtonColor() {
		return get( props.textButtonColor, 'color' );
	}

	function getBackgroundButtonColor() {
		return get( props.backgroundButtonColor, 'color' );
	}

	function getButtonClasses() {
		const { textButtonColor, backgroundButtonColor } = props;
		const textClass = get( textButtonColor, 'class' );
		const backgroundClass = get( backgroundButtonColor, 'class' );
		return classnames( 'wp-block-button__link', {
			'has-text-color': textButtonColor.color,
			[ textClass ]: textClass,
			'has-background': backgroundButtonColor.color,
			[ backgroundClass ]: backgroundClass,
		} );
	}

	const {
		attributes,
		setAttributes,
		backgroundButtonColor,
		textButtonColor,
		setBackgroundButtonColor,
		setTextButtonColor,
		fallbackBackgroundColor,
		fallbackTextColor,
	} = props;

	const backgroundColor = backgroundButtonColor.color || fallbackBackgroundColor;
	const color = textButtonColor.color || fallbackTextColor;
	const buttonStyle = { border: 'none', backgroundColor, color };
	const buttonClasses = getButtonClasses();

	return (
		<div>
			<div className="wp-block-button premium-content-logged-out-view-button">
				<RichText
					placeholder={ __( 'Add text…', 'premium-content' ) }
					value={ attributes.subscribeButtonText }
					onChange={ ( nextValue ) => setAttributes( { subscribeButtonText: nextValue } ) }
					className={ buttonClasses }
					style={ buttonStyle }
					keepPlaceholderOnFocus
				/>
				<RichText
					placeholder={ __( 'Add text…', 'premium-content' ) }
					value={ attributes.loginButtonText }
					onChange={ ( nextValue ) => setAttributes( { loginButtonText: nextValue } ) }
					className={ buttonClasses }
					style={ buttonStyle }
					keepPlaceholderOnFocus
				/>
			</div>
			<InspectorControls>
				<PanelColorSettings
					title={ __( 'Button Color Settings', 'premium-content' ) }
					colorSettings={ [
						{
							value: backgroundButtonColor || undefined,
							onChange: setBackgroundButtonColor,
							label: __( 'Background Color', 'premium-content' ),
						},
						{
							value: textButtonColor || undefined,
							onChange: setTextButtonColor,
							label: __( 'Text Color', 'premium-content' ),
						},
					] }
				/>
				<ContrastChecker
					textColor={ color }
					backgroundColor={ backgroundColor }
					fallbackBackgroundColor={ fallbackBackgroundColor }
					fallbackTextColor={ fallbackTextColor }
				/>
			</InspectorControls>
		</div>
	);
}

export default compose( [
	withColors( { backgroundButtonColor: 'background-color' }, { textButtonColor: 'color' } ),
	applyFallbackStyles,
] )( SubmitButtons );
