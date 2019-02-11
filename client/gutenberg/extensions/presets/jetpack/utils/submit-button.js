/**
 * External dependencies
 */
import classnames from 'classnames';
import { Component, Fragment } from '@wordpress/element';
import { compose } from '@wordpress/compose';
import { withFallbackStyles } from '@wordpress/components';
import {
	InspectorControls,
	PanelColorSettings,
	ContrastChecker,
	RichText,
	withColors,
} from '@wordpress/editor';
import { isEqual, get } from 'lodash';

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

class SubmitButton extends Component {
	componentDidUpdate( prevProps ) {
		if (
			! isEqual( this.props.textButtonColor, prevProps.textButtonColor ) ||
			! isEqual( this.props.backgroundButtonColor, prevProps.backgroundButtonColor )
		) {
			const buttonClasses = this.getButtonClasses();
			this.props.setAttributes( { submitButtonClasses: buttonClasses } );
		}
	}
	getButtonClasses() {
		const { textButtonColor, backgroundButtonColor } = this.props;
		const textClass = get( textButtonColor, 'class' );
		const backgroundClass = get( backgroundButtonColor, 'class' );
		return classnames( 'wp-block-button__link', {
			'has-text-color': textButtonColor,
			[ textClass ]: textClass,
			'has-background': backgroundButtonColor,
			[ backgroundClass ]: backgroundClass,
		} );
	}
	render() {
		const {
			attributes,
			fallbackBackgroundColor,
			fallbackTextColor,
			setAttributes,
			setBackgroundButtonColor,
			setTextButtonColor,
		} = this.props;

		const backgroundColor = attributes.customBackgroundButtonColor || fallbackBackgroundColor;
		const color = attributes.customTextButtonColor || fallbackTextColor;
		const buttonStyle = { border: 'none', backgroundColor, color };
		const buttonClasses = this.getButtonClasses();

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
						formattingControls={ [] }
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
					<ContrastChecker textColor={ color } backgroundColor={ backgroundColor } />
				</InspectorControls>
			</Fragment>
		);
	}
}

export default compose( [
	withColors( 'backgroundButtonColor', { textButtonColor: 'color' } ),
	applyFallbackStyles,
] )( SubmitButton );
