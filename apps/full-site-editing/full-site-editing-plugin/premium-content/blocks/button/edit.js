/**
 * External dependencies
 */
import classnames from 'classnames';

/**
 * WordPress dependencies
 */
import { __ } from '@wordpress/i18n';
import { useCallback } from '@wordpress/element';
import { Button, ButtonGroup, PanelBody, RangeControl } from '@wordpress/components';
import { InspectorControls, RichText, __experimentalBlock as Block } from '@wordpress/block-editor';

const MIN_BORDER_RADIUS_VALUE = 0;
const MAX_BORDER_RADIUS_VALUE = 50;
const INITIAL_BORDER_RADIUS_POSITION = 5;

function BorderPanel( { borderRadius = '', setAttributes } ) {
	const setBorderRadius = useCallback(
		( newBorderRadius ) => {
			setAttributes( { borderRadius: newBorderRadius } );
		},
		[ setAttributes ]
	);
	return (
		<PanelBody title={ __( 'Border settings', 'full-site-editing' ) }>
			<RangeControl
				value={ borderRadius }
				label={ __( 'Border radius', 'full-site-editing' ) }
				min={ MIN_BORDER_RADIUS_VALUE }
				max={ MAX_BORDER_RADIUS_VALUE }
				initialPosition={ INITIAL_BORDER_RADIUS_POSITION }
				allowReset
				onChange={ setBorderRadius }
			/>
		</PanelBody>
	);
}

const BUTTON_TYPES = {
	subscribe: __( 'Subscribe', 'full-site-editing' ),
	login: __( 'Log in', 'full-site-editing' ),
};

function ButtonEdit( { attributes, setAttributes, className } ) {
	const { borderRadius, text, type } = attributes;

	return (
		<>
			<RichText
				tagName={ Block.div }
				placeholder={ __( 'Add text…', 'full-site-editing' ) }
				value={ text }
				onChange={ ( value ) => setAttributes( { text: value } ) }
				withoutInteractiveFormatting
				className={ classnames( className, 'wp-block-button__link', {
					'no-border-radius': borderRadius === 0,
				} ) }
				style={ {
					borderRadius: borderRadius ? borderRadius + 'px' : undefined,
				} }
			/>
			<InspectorControls>
				<PanelBody title={ __( 'Button Type', 'full-site-editing' ) }>
					<ButtonGroup aria-label={ __( 'Button Type', 'full-site-editing' ) }>
						{ Object.entries( BUTTON_TYPES ).map( ( [ buttonType, buttonText ] ) => (
							<Button
								key={ buttonType }
								isLarge
								isPrimary={ type === buttonType }
								aria-pressed={ type === buttonType }
								onClick={ () =>
									setAttributes( {
										type: buttonType,
										text: buttonText,
									} )
								}
							>
								{ buttonText }
							</Button>
						) ) }
					</ButtonGroup>
				</PanelBody>
				<BorderPanel borderRadius={ borderRadius } setAttributes={ setAttributes } />
			</InspectorControls>
		</>
	);
}

export default ButtonEdit;
