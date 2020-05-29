import { __ } from '@wordpress/i18n';
import { useEffect } from '@wordpress/element';
import { compose } from '@wordpress/compose';
import { Button, ButtonGroup, PanelBody, withFallbackStyles } from '@wordpress/components';
import {
	BlockAlignmentToolbar,
	BlockControls,
	ContrastChecker,
	InspectorControls,
	PanelColorSettings,
	RichText,
	withColors,
} from '@wordpress/block-editor';
import { get } from 'lodash';
import classnames from 'classnames';

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

const blockControls = ( props ) => {
	return (
		<BlockControls>
			<BlockAlignmentToolbar
				value={ props.attributes.align }
				onChange={ ( newAlignment ) => props.setAttributes( { align: newAlignment } ) }
				controls={ [ 'left', 'center', 'right' ] }
			/>
		</BlockControls>
	);
};

const inspectorControls = ( props ) => {
	const BUTTON_TYPES = {
		login: {
			label: __( 'Login', 'premium-content' ),
			defaultButtonText: __( 'Log In', 'premium-content' ),
		},
		subscribe: {
			label: __( 'Subscribe', 'premium-content' ),
			defaultButtonText: __( 'Subscribe', 'premium-content' ),
		},
	};

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

	function setButtonType( props, type, text ) {
		props.setAttributes( {
			buttonType: type,
			buttonText: text,
		} );
	}

	return (
		<InspectorControls>
			<PanelBody title={ __( 'Button Type', 'premium-content' ) }>
				<div className="premium-content-button-group">
					<ButtonGroup aria-label={ __( 'Button Type', 'premium-content' ) }>
						{ Object.keys( BUTTON_TYPES ).map( ( t ) => (
							<Button
								isLarge
								isPrimary={ attributes.buttonType === t }
								aria-pressed={ attributes.buttonType === t }
								onClick={ () => setButtonType( props, t, BUTTON_TYPES[ t ].defaultButtonText ) }
							>
								{ BUTTON_TYPES[ t ].label }
							</Button>
						) ) }
					</ButtonGroup>
				</div>
			</PanelBody>
			<PanelColorSettings
				title={ __( 'Button Colors', 'premium-content' ) }
				initialOpen={ true }
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
	);
};

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
function Edit( props ) {
	useEffect( () => {
		setButtonClasses();
		setCustomButtonColors();
		setBlockContext();
	}, [ props.backgroundButtonColor, props.textButtonColor, props.context ] );

	function setBlockContext() {
		const { context } = props;
		props.setAttributes( context );
	}

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
		isSelected,
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

	return [
		isSelected && blockControls( props ),

		isSelected && inspectorControls( props ),

		<div className={ props.className }>
			<div className="wp-block-button premium-content-logged-out-view-button">
				<RichText
					placeholder={ __( 'Add text…', 'premium-content' ) }
					value={ attributes.buttonText }
					onChange={ ( nextValue ) => setAttributes( { buttonText: nextValue } ) }
					className={ buttonClasses }
					style={ buttonStyle }
					allowedFormats={ [ 'core/bold', 'core/italic', 'core/strikethrough' ] }
					keepPlaceholderOnFocus={ true }
				/>
			</div>
		</div>,
	];
}

export default compose( [
	withColors( { backgroundButtonColor: 'background-color' }, { textButtonColor: 'color' } ),
	applyFallbackStyles,
] )( Edit, inspectorControls );
